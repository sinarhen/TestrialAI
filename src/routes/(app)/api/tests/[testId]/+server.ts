import type { RequestHandler } from '@sveltejs/kit';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { tests } from '@/server/db/schema';
import { validate } from 'uuid';

export const DELETE: RequestHandler = async ({ params, locals }) => {
	if (!locals.user || !locals.session) {
		return new Response('You are unauthorized', { status: 401 });
	}
	const id = params.id;

	if (!id || !validate(id)) {
		return new Response('Test not found', { status: 404 });
	}
	const existingTest = await db.query.tests.findFirst({
		where: eq(tests.id, id)
	});

	if (!existingTest || existingTest.userId !== locals.user.id) {
		return new Response('Test not found', { status: 404 });
	}

	await db.delete(tests).where(eq(tests.id, id));

	return new Response('Successfully deleted', { status: 200 });
};
