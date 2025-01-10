import type { RequestHandler } from '@sveltejs/kit';
import type { SupportedModel } from '@/types/openai';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { surveys } from '@/server/db/schema';
import { generateQuestion } from '@/server/openai/completions/question';

export interface GenerateQuestionDto {
	topic: string;
	model?: SupportedModel;
}

export const POST: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.session || !locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const data = (await request.json()) as GenerateQuestionDto;

		const topic = data.topic;

		if (!topic) {
			return new Response('Topic is required', { status: 400 });
		}
		const surveyId = params.surveyId;

		if (!surveyId) {
			console.error('Survey ID is required');
			return new Response('Survey id is required', { status: 400 });
		}

		const survey = await db.query.surveys.findFirst({
			where: eq(surveys.id, surveyId),
			with: {
				questions: {
					columns: {
						question: true
					}
				}
			}
		});

		if (!survey || survey.userId !== locals.user.id) {
			console.error('Survey not found');
			return new Response('Survey not found', { status: 404 });
		}

		const existingQuestions = survey.questions?.map((q) => q.question);

		const openAIStream = generateQuestion(
			{
				topic,
				existingQuestions,
				surveyDifficulty: survey.difficulty,
				surveyTitle: survey.title
			},
			{
				model: data.model ?? 'gpt-4o-mini'
			}
		);

		return new Response(openAIStream.toReadableStream());
	} catch (e) {
		console.error(e);
		return new Response('An error has occurred while generating.', { status: 500 });
	}
};
