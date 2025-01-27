import { testSchema, type TestCompletion } from '@/types/entities';
import { type RequestHandler } from '@sveltejs/kit';
import { db } from '@/server/db';
import * as table from '@/server/db/schema';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || !locals.session) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const test = await request.json();
		if (!test) {
			return new Response('Invalid data', { status: 400 });
		}

		const parsed = await testSchema.safeParseAsync(test);

		if (!parsed.success) {
			console.log(parsed.error);
			return new Response('Invalid data', { status: 400 });
		}

		const testId = await saveTestToDatabase(parsed.data, locals.user.id);

		return new Response(JSON.stringify(testId), {
			status: 200
		});
	} catch (e) {
		console.error(e);
		return new Response('Failed to save test', { status: 500 });
	}
};

const saveTestToDatabase = async (parsedTest: TestCompletion, createdBy: string) =>
	await db.transaction(async (tx) => {
		// Insert SURVEY
		const [insertedTest] = await tx
			.insert(table.tests)
			.values({
				...parsedTest,
				userId: createdBy
			})
			.returning({
				id: table.tests.id,
				createdAt: table.tests.createdAt,
				updatedAt: table.tests.updatedAt
			});

		if (!insertedTest.id) {
			throw new Error('Failed to insert test');
		}

		// Insert QUESTIONS and OPTIONS
		for (const question of parsedTest.questions ?? []) {
			const [insertedQuestion] = await tx
				.insert(table.questions)
				.values({
					...question,
					testId: insertedTest.id
				})
				.returning({
					id: table.questions.id
				});

			if (!insertedQuestion) {
				throw new Error('Failed to insert question');
			}

			if (!question.options) {
				continue;
			}
			for (const option of question.options) {
				const [insertedOption] = await tx
					.insert(table.options)
					.values({
						// id: newOptionId,
						...option,
						questionId: insertedQuestion.id
					})
					.returning({ id: table.options.id });

				if (!insertedOption) {
					throw new Error('Failed to insert option');
				}
			}
		}
		return insertedTest.id;
	});
