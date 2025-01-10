import { db } from '@/server/db';
import type { PageServerLoad } from './$types';
import { validate } from 'uuid';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	if (!validate(params.id)) {
		return error(404, 'Survey not found');
	}

	const survey = await db.query.surveys.findFirst({
		where: (surveys, { eq }) => eq(surveys.id, params.id),
		with: {
			questions: {
				with: {
					options: true
				}
			}
		}
	});

	if (!survey) {
		return error(404, 'Survey not found');
	}

	return {
		survey
	};
};
