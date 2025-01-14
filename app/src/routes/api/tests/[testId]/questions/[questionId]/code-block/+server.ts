import { type Question, type Test } from '@/types/entities';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import * as table from '@/server/db/schema';
import { generateCodeBlock } from '@/server/openai/completions/question/code-block';

export type GenerateCodeBlockDto = {
	question: string;
	options: string[];
};

export const POST: RequestHandler = async ({ locals, params }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const questionId = params.questionId;
	const testId = params.testId;
	if (!questionId) {
		return new Response('Invalid data', { status: 400 });
	}

	const existingQuestion = await db.query.questions.findFirst({
		where: eq(table.questions.id, questionId),
		with: {
			test: {
				columns: {
					userId: true,
					title: true
				}
			}
		}
	});

	if (existingQuestion?.testId !== testId || existingQuestion?.test.userId !== locals.user.id) {
		return new Response('Test not found', { status: 404 });
	}
	if (!existingQuestion) {
		return new Response('Question not found', { status: 404 });
	}

	const result = await generateCodeBlock({
		question: existingQuestion.question,
		testTitle: existingQuestion.test.title
	});

	return new Response(result.toReadableStream(), { status: 200 });
};
