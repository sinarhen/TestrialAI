import { api } from '@/tanstack-query/index.js';

export const load = async ({ parent, fetch }) => {
	const { queryClient } = await parent();

	const _api = api({ fetch });

	await queryClient.prefetchQuery({
		..._api.users.me()
	});
	await queryClient.prefetchQuery({
		..._api.tests.getTestsHistory()
	});

	return {};
};
