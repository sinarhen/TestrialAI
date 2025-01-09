import { type Question, type Option, type QuestionCompletion, type Survey } from '@/types/entities';
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
		const id = params.surveyId;

		if (!id) {
			return new Response('Invalid data', { status: 400 });
		}

		const body: CreateQuestionDto = await request.json();

		const existingSurvey = await db.query.surveys.findFirst({
			where: eq(table.surveys.id, id)
		});

		if (!existingSurvey || existingSurvey.userId !== locals.user.id) {
			return new Response('Survey not found', { status: 404 });
		}

		let createdQuestion = {};

		await db.transaction(async (tx) => {
			const [insertedQuestion] = await tx
				.insert(table.questions)
				.values({
					surveyId: id,
					...body
				})
				.returning();

			if (!insertedQuestion) {
				throw new Error('Failed to insert question');
			}

			createdQuestion = insertedQuestion;

			if (!body.options) {
				return;
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

			createdQuestion = {
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
