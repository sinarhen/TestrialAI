import { api } from '@/client-api/index.js';
import { parseClientResponse } from '@/utils/api.js';
import { error } from '@sveltejs/kit';

export const load = async ({ fetch, params, parent }) => {
	const testSessionCode = params.sessionCode;
	try {
		const session = await api({ fetch })
			['test-sessions'][':testSessionCode'].$get({
				param: {
					testSessionCode
				}
			})
			.then(parseClientResponse);
		if (session.error) {
			return error(500, session.error);
		}
		if (!session.data) {
			return error(404, 'Session not found');
		}

		const { user } = await parent();

		return {
			session: session.data,
			user
		};
	} catch (err) {
		console.error(err);
		return error(500, 'Server error');
	}
};
