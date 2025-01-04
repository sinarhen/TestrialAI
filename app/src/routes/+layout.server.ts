import { db } from '@/server/db';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, params }) => {
	// select all surveys from the database related to the user with questions
	const history = locals.user
		? await db.query.surveys.findMany({
				where: (surveys, { eq }) => eq(surveys.userId, locals.user!.id),
				with: {
					questions: {
						with: {
							options: true
						}
					}
				},
				orderBy: (surveys, { desc }) => desc(surveys.updatedAt)
			})
		: null;

	return {
		user: locals.user,
		history
	};
};
