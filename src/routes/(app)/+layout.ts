import { api } from '@/tanstack-query/index.js';

export const load = async ({ parent, fetch }) => {
	const { queryClient } = await parent();

	const _api = api({ fetch });

	const user = await queryClient.fetchQuery(api({ fetch }).users.me());
	if (user) {
		await queryClient.prefetchQuery({
			..._api.tests.getTestsHistory()
		});
	}
};
