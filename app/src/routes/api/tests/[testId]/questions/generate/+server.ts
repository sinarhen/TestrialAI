import type { RequestHandler } from '@sveltejs/kit';
import type { SupportedModel } from '@/types/openai';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { tests } from '@/server/db/schema';
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
		const testId = params.testId;

		if (!testId) {
			console.error('Test ID is required');
			return new Response('Test id is required', { status: 400 });
		}

		const test = await db.query.tests.findFirst({
			where: eq(tests.id, testId),
			with: {
				questions: {
					columns: {
						question: true
					}
				}
			}
		});

		if (!test || test.userId !== locals.user.id) {
			console.error('Test not found');
			return new Response('Test not found', { status: 404 });
		}

		const existingQuestions = test.questions?.map((q) => q.question);

		const openAIStream = generateQuestion(
			{
				topic,
				existingQuestions,
				testTitle: test.title
			},
			{
				model: data.model ?? 'gpt-4o-mini'
			}
		);

		for await (const chunk of openAIStream) {
		}

		// return new Response(openAIStream.toReadableStream());
	} catch (e) {
		console.error(e);
		return new Response('An error has occurred while generating.', { status: 500 });
	}
};
