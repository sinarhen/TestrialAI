import { api } from '@/client/api';
import { parseClientResponse } from '@/client/utils/api';
import { error } from '@sveltejs/kit';

export async function load({ params }) {
	const { testSessionToken } = params;

	// TODO: bad practice to combine sveltekit and server api here. (should be in a controller)
	// Maybe create an sveltekit handler that can be used in sveltekit routes?
	// const resp = await container
	// 	.resolve(TestSessionsService)
	// 	.getTestSessionPublicData(testSessionToken);

	const resp = await api()
		['test-sessions'][':testSessionToken'].test.$get({ param: { testSessionToken } })
		.then(parseClientResponse);

	if (!resp.data || resp.error) {
		console.error(resp.error);
		return error(404);
	}

	return { testSession: resp.data, token: testSessionToken };
}
