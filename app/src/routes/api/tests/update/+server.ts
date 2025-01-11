// DEPRECATED, BUT KEEPING FOR REFERENCE

// import { type Test } from '@/types/entities';
// import type { RequestHandler } from '@sveltejs/kit';
// import { db } from '@/server/db';
// import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
// import * as table from '@/server/db/schema';

// export const POST: RequestHandler = async ({ request, locals }) => {
// 	if (!locals.user) {
// 		return new Response('Unauthorized', { status: 401 });
// 	}

// 	const test = (await request.json()) as Test;
// 	if (!test || !test.id) {
// 		return new Response('Invalid data', { status: 400 });
// 	}

// 	const existingTest = await db.query.tests.findFirst({
// 		where: eq(table.tests.id, test.id)
// 	});

// 	if (!existingTest || existingTest.userId !== locals.user.id) {
// 		return new Response('Test not found', { status: 404 });
// 	}

// 	await updateTest(test);

// 	return new Response('Success', { status: 200 });
// };

// const updateTest = (test: Test) =>
// 	db.transaction(async (tx) => {
// 		await tx
// 			.insert(table.questions)
// 			.values(
// 				test.questions.map((q) => ({
// 					id: q.id,
// 					testId: test.id,
// 					question: q.question,
// 					answerType: q.answerType,
// 					correctAnswer: q.correctAnswer
// 				}))
// 			)
// 			.onConflictDoUpdate({
// 				target: table.questions.id,
// 				set: {
// 					testId: sql`excluded.test_id`,
// 					question: sql`excluded.question`,
// 					answerType: sql`excluded.answer_type`,
// 					correctAnswer: sql`excluded.correct_answer`
// 				}
// 			});

// 		await tx
// 			.insert(table.options)
// 			.values(
// 				test.questions.flatMap((q) =>
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

// 		const questionIds = test.questions.map((q) => q.id);
// 		const optionIds = test.questions.flatMap((q) => q.options.map((o) => o.id));

// 		// Delete old options
// 		await tx
// 			.delete(table.options)
// 			.where(
// 				and(
// 					inArray(
// 						table.options.questionId,
// 						sql`(SELECT id FROM ${table.questions} WHERE ${eq(table.questions.testId, test.id)})`
// 					),
// 					notInArray(table.options.id, optionIds)
// 				)
// 			);

// 		// Delete old questions
// 		await tx
// 			.delete(table.questions)
// 			.where(
// 				and(eq(table.questions.testId, test.id), notInArray(table.questions.id, questionIds))
// 			);
// 	});
