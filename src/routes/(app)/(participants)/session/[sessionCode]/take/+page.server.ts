import { api } from '@/client-api';
import { parseClientResponse } from '@/utils/api.js';

export default async function load({ params, fetch }) {
	const { sessionCode } = params;
	const testSession = await api({ fetch })
		['test-sessions'][':testSessionCode'].$get({
			param: {
				testSessionCode: sessionCode
			}
		})
		.then(parseClientResponse);

	return { testSession };
}
