import { type Question, type Test } from '@/types/entities';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '@/server/db';
import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
import * as table from '@/server/db/schema';
import type { PartialBy } from '@/types/utils';
import type { Option } from '@/types/entities';

export type UpdateQuestionDto = Omit<Question, 'options'> & {
	options: PartialBy<Option, 'id'>[] | null;
};

export const DELETE: RequestHandler = async ({ locals, params }) => {
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
					userId: true
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

	await db.delete(table.questions).where(eq(table.questions.id, questionId));

	return new Response('Success', { status: 200 });
};

export const PUT: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}
	const updatedQuestion = (await request.json()) as UpdateQuestionDto;
	if (!updatedQuestion || !updatedQuestion.id) {
		return new Response('Invalid data', { status: 400 });
	}

	try {
		const questionId = params.questionId;
		const testId = params.testId;

		const existingQuestion = await db.query.questions.findFirst({
			where: eq(table.questions.id, questionId!),
			with: {
				test: {
					columns: {
						userId: true
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

		const questionUpdateResult = await updateQuestion(updatedQuestion);

		return new Response(JSON.stringify(questionUpdateResult));
	} catch (e) {
		console.error(e);
		return new Response('Failed to update question', { status: 500 });
	}
};

const updateQuestion = async (question: UpdateQuestionDto): Promise<Question> => {
	return await db.transaction(async (tx) => {
		const [updatedQuestion] = await tx
			.update(table.questions)
			.set(question)
			.where(eq(table.questions.id, question.id))
			.returning();

		let insertedOptions: Option[] = [];
		if (question.options) {
			insertedOptions = await tx
				.insert(table.options)
				.values(
					question.options.map((o) => ({
						id: o.id,
						questionId: question.id,
						value: o.value,
						isCorrect: o.isCorrect
					}))
				)
				.onConflictDoUpdate({
					target: table.options.id,
					set: {
						questionId: sql`excluded.question_id`,
						value: sql`excluded.value`,
						isCorrect: sql`excluded.is_correct`
					}
				})
				.returning();
		}
		if (insertedOptions?.length) {
			const insertedOptionsIds = insertedOptions.map((o) => o.id);

			await tx
				.delete(table.options)
				.where(
					and(
						eq(table.options.questionId, question.id),
						notInArray(table.options.id, insertedOptionsIds)
					)
				);
		} else {
			await tx.delete(table.options).where(eq(table.options.questionId, question.id));
		}

		return {
			...updatedQuestion,
			options: insertedOptions
		};
	});
};
