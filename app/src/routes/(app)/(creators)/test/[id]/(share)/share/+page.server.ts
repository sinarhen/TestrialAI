import { db } from '@/server/db';
import type { PageServerLoad } from './$types';
import { validate } from 'uuid';
import { error } from '@sveltejs/kit';

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

	return {
		test
	};
};
