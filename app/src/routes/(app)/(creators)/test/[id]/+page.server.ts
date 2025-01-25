import { db } from '@/server/db';
import type { PageServerLoad } from './$types';
import { validate } from 'uuid';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { testSessions } from '@/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	if (!validate(params.id)) {
		return error(404, 'Test not found');
	}

	const test = await db.query.tests.findFirst({
		where: (tests, { eq }) => eq(tests.id, params.id),
		with: {
			questions: {
				with: {
					options: true
				}
			}
		}
	});

	if (!test) {
		return error(404, 'Test not found');
	}
	const sessions = await db.query.testSessions.findMany({
		where: eq(testSessions.testId, params.id),
		with: {
			participants: true
		}
	});

	return {
		test,
		sessions
	};
};
