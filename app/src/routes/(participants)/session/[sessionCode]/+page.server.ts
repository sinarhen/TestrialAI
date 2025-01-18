import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { testSessions } from '@/server/db/schema';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { sessionCode } = params;
	if (!sessionCode) {
		return error(404, 'Session not found');
	}

	const session = await db.query.testSessions.findFirst({
		where: eq(testSessions.code, sessionCode),
		with: {
			participants: true,
			test: {
				with: {
					user: {
						columns: {
							username: true
						}
					}
				}
			}
		}
	});

	if (!session) {
		return error(404, 'Session not found');
	}

	return {
		session,
		user: locals.user
	};
};
