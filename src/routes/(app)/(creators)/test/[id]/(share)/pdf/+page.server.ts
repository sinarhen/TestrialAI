import { error } from '@sveltejs/kit';
import { api } from '@/client/api/index.js';
import { parseClientResponse } from '@/client/utils/api.js';

export const load = async ({ params, fetch }) => {
	const test = await api({ fetch })
		.tests[':testId'].$get({
			param: {
				testId: params.id
			}
		})
		.then(parseClientResponse);
	
	if (test.error) {
		return error(500, test.error);
	}
	if (!test.data) {
		return error(404, 'Test not found');
	}

	return {
		test: test.data
	};
};
