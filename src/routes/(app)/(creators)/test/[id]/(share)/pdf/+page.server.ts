import { validate } from 'uuid';
import { error } from '@sveltejs/kit';
import { api } from '@/client-api/index.js';

export const load = async ({ params }) => {
	if (!validate(params.id)) {
		return error(404, 'Test not found');
	}

	const test = await api().tests[':testId'].$get({
		param: {
			testId: params.id
		}
	});
	if (!test) {
		return error(404, 'Test not found');
	}

	return {
		test
	};
};
