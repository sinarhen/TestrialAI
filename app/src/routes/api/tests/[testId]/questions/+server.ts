import { type Question, type Option, type QuestionCompletion, type Test } from '@/types/entities';
import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import * as table from '@/server/db/schema';

export type CreateQuestionDto = QuestionCompletion;

export const POST: RequestHandler = async ({ locals, request, params }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}
	try {
		const id = params.testId;

		if (!id) {
			return new Response('Invalid data', { status: 400 });
		}

		const body: CreateQuestionDto = await request.json();

		const existingTest = await db.query.tests.findFirst({
			where: eq(table.tests.id, id)
		});

		if (!existingTest || existingTest.userId !== locals.user.id) {
			return new Response('Test not found', { status: 404 });
		}

		const createdQuestion = await db.transaction(async (tx) => {
			const [insertedQuestion] = await tx
				.insert(table.questions)
				.values({
					testId: id,
					...body
				})
				.returning();

			if (!insertedQuestion) {
				throw new Error('Failed to insert question');
			}

			if (!body.options) {
				return insertedQuestion;
			}
			const insertedOptions = await tx
				.insert(table.options)
				.values(
					body.options.map((option) => ({
						questionId: insertedQuestion.id,
						...option
					}))
				)
				.returning();

			if (!insertedOptions) {
				throw new Error('Failed to insert options');
			}

			return {
				...insertedQuestion,
				options: insertedOptions
			} as Question;
		});

		return json(createdQuestion);
	} catch (error) {
		console.error(error);
		return new Response('Internal server error', { status: 500 });
	}
};
