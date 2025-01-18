import { redirect, type RequestHandler } from '@sveltejs/kit';
import * as auth from '@/server/auth';

export const POST: RequestHandler = async (event) => {
	if (!event.locals.session) {
		return redirect(302, '/');
	}
	await auth.invalidateSession(event.locals.session.id);
	auth.deleteSessionTokenCookie(event);

	return new Response('Logged out successfully', { status: 200 });
};
