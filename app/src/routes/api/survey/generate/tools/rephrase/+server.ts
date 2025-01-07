import { openai } from '@/server/openai';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session || !locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}
	return new Response();
};
