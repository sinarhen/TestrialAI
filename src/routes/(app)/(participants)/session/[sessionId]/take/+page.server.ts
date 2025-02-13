import { api } from '@/client-api';
import { parseClientResponse } from '@/utils/api.js';
import { error } from '@sveltejs/kit';

export async function load({ params, fetch }) {
	const { sessionId } = params;
	const resp = await api({ fetch })
		['test-sessions'][':testSessionId'].test.$get({
			param: {
				testSessionId: sessionId
			}
		})
		.then(parseClientResponse);

	if (!resp.data) {
		return error(404);
	}

	return { testSession: resp.data };
}
