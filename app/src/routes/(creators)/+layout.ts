import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ url, data }) => {
	const params = url.searchParams;
	const authRequired = !!params.get('authRequired');
	return {
		authRequired,
		...data
	};
};
