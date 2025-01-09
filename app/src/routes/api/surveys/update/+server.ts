// DEPRECATED, BUT KEEPING FOR REFERENCE

// import { type Survey } from '@/types/entities';
// import type { RequestHandler } from '@sveltejs/kit';
// import { db } from '@/server/db';
// import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
// import * as table from '@/server/db/schema';

// export const POST: RequestHandler = async ({ request, locals }) => {
// 	if (!locals.user) {
// 		return new Response('Unauthorized', { status: 401 });
// 	}

// 	const survey = (await request.json()) as Survey;
// 	if (!survey || !survey.id) {
// 		return new Response('Invalid data', { status: 400 });
// 	}

// 	const existingSurvey = await db.query.surveys.findFirst({
// 		where: eq(table.surveys.id, survey.id)
// 	});

// 	if (!existingSurvey || existingSurvey.userId !== locals.user.id) {
// 		return new Response('Survey not found', { status: 404 });
// 	}

// 	await updateSurvey(survey);

// 	return new Response('Success', { status: 200 });
// };

// const updateSurvey = (survey: Survey) =>
// 	db.transaction(async (tx) => {
// 		await tx
// 			.insert(table.questions)
// 			.values(
// 				survey.questions.map((q) => ({
// 					id: q.id,
// 					surveyId: survey.id,
// 					question: q.question,
// 					answerType: q.answerType,
// 					correctAnswer: q.correctAnswer
// 				}))
// 			)
// 			.onConflictDoUpdate({
// 				target: table.questions.id,
// 				set: {
// 					surveyId: sql`excluded.survey_id`,
// 					question: sql`excluded.question`,
// 					answerType: sql`excluded.answer_type`,
// 					correctAnswer: sql`excluded.correct_answer`
// 				}
// 			});

// 		await tx
// 			.insert(table.options)
// 			.values(
// 				survey.questions.flatMap((q) =>
// 					q.options.map((o) => ({
// 						id: o.id,
// 						questionId: q.id,
// 						value: o.value,
// 						isCorrect: o.isCorrect
// 					}))
// 				)
// 			)
// 			.onConflictDoUpdate({
// 				target: table.options.id,
// 				set: {
// 					questionId: sql`excluded.question_id`,
// 					value: sql`excluded.value`,
// 					isCorrect: sql`excluded.is_correct`
// 				}
// 			});

// 		const questionIds = survey.questions.map((q) => q.id);
// 		const optionIds = survey.questions.flatMap((q) => q.options.map((o) => o.id));

// 		// Delete old options
// 		await tx
// 			.delete(table.options)
// 			.where(
// 				and(
// 					inArray(
// 						table.options.questionId,
// 						sql`(SELECT id FROM ${table.questions} WHERE ${eq(table.questions.surveyId, survey.id)})`
// 					),
// 					notInArray(table.options.id, optionIds)
// 				)
// 			);

// 		// Delete old questions
// 		await tx
// 			.delete(table.questions)
// 			.where(
// 				and(eq(table.questions.surveyId, survey.id), notInArray(table.questions.id, questionIds))
// 			);
// 	});
