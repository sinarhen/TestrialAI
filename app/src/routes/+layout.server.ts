import { db } from '@/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	// select all tests from the database related to the user with questions
	const history = locals.user
		? await db.query.tests.findMany({
				where: (tests, { eq }) => eq(tests.userId, locals.user!.id),
				with: {
					questions: {
						with: {
							options: true
						}
					}
				},
				orderBy: (tests, { desc }) => desc(tests.updatedAt)
			})
		: null;

	return {
		user: locals.user,
		history
	};
};
