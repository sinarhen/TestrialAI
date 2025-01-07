import type { RequestHandler } from '@sveltejs/kit';
import { generateQuestion } from '@/server/openai/completions/question';
import type { Difficulty } from '@/types/entities';
import type { SupportedModel } from '@/types/openai';

export interface GenerateQuestionDto {
	topic: string;
	surveyId: string;
	surveyTitle: string;
	surveyDifficulty: Difficulty;
	existingQuestions: string[];
	model?: SupportedModel;
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session || !locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const data = (await request.json()) as GenerateQuestionDto;

		const topic = data.topic;

		if (!topic) {
			return new Response('Topic is required', { status: 400 });
		}
		const surveyId = data.surveyId;

		if (!surveyId) {
			console.error('Survey ID is required');
			return new Response('Survey id is required', { status: 400 });
		}

		if (!data.surveyTitle) {
			console.error('Survey title is required');
			return new Response('Survey title is required', { status: 400 });
		}

		if (!data.surveyDifficulty) {
			console.error('Survey difficulty is required');
			return new Response('Survey difficulty is required', { status: 400 });
		}

		const existingQuestions = data.existingQuestions;
		if (!data.existingQuestions) {
			console.error('Existing questions is required to generate-question single questions');
			return new Response('existingQuestions is required', { status: 400 });
		}

		const openAIStream = generateQuestion(
			{
				topic,
				existingQuestions,
				surveyDifficulty: data.surveyDifficulty,
				surveyTitle: data.surveyTitle
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
