import * as auth from '@/server/auth';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import type {PageServerLoad} from "../../.svelte-kit/types/src/routes/$types";

export const load: PageServerLoad = async (event) => (
	{ user: event.locals.user }
);

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return redirect(302, '/');
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return redirect(302, '/demo/lucia/login');
	}
};
