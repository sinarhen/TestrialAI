import type { RequestHandler } from '@sveltejs/kit';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { surveys } from '@/server/db/schema';
import { validate } from 'uuid';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || !locals.session) {
		return new Response('You are unauthorized', { status: 401 });
	}
	const id = params.id;

	if (!id || !validate(id)) {
		return new Response('Survey not found', { status: 404 });
	}
	const existingSurvey = await db.query.surveys.findFirst({
		where: eq(surveys.id, id)
	});

	if (!existingSurvey || existingSurvey.userId !== locals.user.id) {
		return new Response('Survey not found', { status: 404 });
	}

	await db.delete(surveys).where(eq(surveys.id, id));

	return new Response('Successfully deleted', { status: 200 });
};
