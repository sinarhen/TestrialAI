import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals.session || !locals.user) {
		return redirect(301, '/');
	}
	return {};
};
