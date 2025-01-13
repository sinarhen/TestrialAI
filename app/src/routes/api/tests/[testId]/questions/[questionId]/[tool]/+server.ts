import { db } from '@/server/db';
import { questions, tests } from '@/server/db/schema';
import { regenerateQuestionWithTool } from '@/server/openai/completions/question/tools';
import type { QuestionModificationTool } from '@/types/openai';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export type ModifyQuestionDto = {
	// TODO: additionalPrompt?: string;
};

export const POST: RequestHandler = async ({ locals, request, params }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}
	try {
		const questionId = params.questionId!;
		const testId = params.testId!;
		const tool = params.tool as QuestionModificationTool; // TODO: add param matcher

		const existingQuestion = await db.query.questions.findFirst({
			where: eq(questions.id, questionId),
			with: {
				test: {
					columns: {
						userId: true,
						title: true
					}
				}
			}
		});

		if (
			!existingQuestion ||
			existingQuestion.test.userId !== locals.user.id ||
			existingQuestion.testId !== testId
		) {
			return new Response('Not found', { status: 404 });
		}

		const openAiStream = regenerateQuestionWithTool({
			questionTopic: existingQuestion.question,
			existingQuestions: [existingQuestion.question],
			tool,
			testTitle: existingQuestion.test.title
		});

		return new Response(openAiStream.toReadableStream());
	} catch (error) {
		return new Response('Internal Server Error', { status: 500 });
	}
};
