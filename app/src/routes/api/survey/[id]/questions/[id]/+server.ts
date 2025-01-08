import { type Question, type Survey } from '@/types/entities';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '@/server/db';
import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
import * as table from '@/server/db/schema';

export type UpdateQuestionDto = Question;

export const POST: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const id = params.id;

	const updatedQuestion = (await request.json()) as UpdateQuestionDto;
	if (!updatedQuestion || !updatedQuestion.id || !id) {
		return new Response('Invalid data', { status: 400 });
	}

	const existingQuestion = await db.query.questions.findFirst({
		where: eq(table.questions.id, id),
		with: {
			survey: {
				columns: {
					userId: true
				}
			}
		}
	});

	if (!existingQuestion || existingQuestion.survey.userId !== locals.user.id) {
		return new Response('Survey not found', { status: 404 });
	}

	await updateQuestion(existingQuestion.surveyId, updatedQuestion);

	return new Response('Success', { status: 200 });
};

const updateQuestion = (surveyId: string, question: Question) =>
	db.transaction(async (tx) => {
		await tx.update(table.questions).set(question).where(eq(table.questions.id, question.id));

		await tx
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
			});

		const optionIds = question.options.map((o) => o.id);

		// Delete old options
		await tx
			.delete(table.options)
			.where(
				and(
					inArray(
						table.options.questionId,
						sql`(SELECT id FROM ${table.questions} WHERE ${eq(table.questions.surveyId, surveyId)})`
					),
					notInArray(table.options.id, optionIds)
				)
			);
	});
