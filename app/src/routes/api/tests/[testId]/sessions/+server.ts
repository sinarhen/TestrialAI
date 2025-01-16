import type { RequestHandler } from '@sveltejs/kit';
import type { SupportedModel } from '@/types/openai';
import { generateTest } from '@/server/openai/completions/test';
import type { DisplayMode, Test } from '@/types/entities';
import { db } from '@/server/db';
import { tests, testSessions } from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { slugify } from '@/utils/slugify';

export type CreateTestSessionDto = {
	displayMode: DisplayMode;
	durationInMinutes: number;
};

export const POST: RequestHandler = async ({ request, locals, params }) => {
	if (!locals.session || !locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}
	const { displayMode, durationInMinutes } = (await request.json()) as CreateTestSessionDto;

	if (!displayMode || !durationInMinutes) {
		return new Response('Invalid request', { status: 400 });
	}

	const currentTestId = params.testId!;

	// sleep

	await new Promise((resolve) => setTimeout(resolve, 3000));

	try {
		// const existingTest = await db.query.tests.findFirst({
		// 	where: eq(tests.id, currentTestId),
		// 	with: {
		// 		questions: {
		// 			with: {
		// 				options: true
		// 			}
		// 		}
		// 	}
		// });

		// if (!existingTest) {
		// 	return new Response('Test not found', { status: 404 });
		// }

		// if (existingTest.userId !== locals.user.id) {
		// 	return new Response('Unauthorized', { status: 401 });
		// }
		// const [createdSlug] = await db
		// 	.insert(testSessions)
		// 	.values({
		// 		testId: existingTest.id,
		// 		slug: slugify(existingTest.title),
		// 		startTime: new Date(),
		// 		endTime: null,
		// 		durationInMinutes,
		// 		testStateJson: existingTest,
		// 		displayMode
		// 	})
		// 	.returning({
		// 		slug: testSessions.slug
		// 	});

		return new Response('TestCode', { status: 201 });
	} catch (error) {
		console.error(error);
		return new Response('Error creating test session', { status: 500 });
	}
};
