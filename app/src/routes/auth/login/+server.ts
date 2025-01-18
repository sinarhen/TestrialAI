import { validatePassword, validateUsername } from '@/utils/auth';
import { verify } from '@node-rs/argon2';
import type { RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import * as table from '$lib/server/db/schema';
import { lucia } from '@/server/lucia/auth';

export const POST: RequestHandler = async (event) => {
	const formData = await event.request.formData();
	const username = formData.get('username');
	const password = formData.get('password');

	if (!validateUsername(username)) {
		return new Response('Invalid username', { status: 400 });
	}
	if (!validatePassword(password)) {
		return new Response('Invalid password', { status: 400 });
	}

	try {
		const results = await db.select().from(table.users).where(eq(table.users.username, username));

		const existingUser = results.at(0);
		if (!existingUser) {
			return new Response('Incorrect username or password', { status: 400 });
		}

		if (!existingUser.passwordHash) {
			return new Response('You are signed in with an external provider. Please sign in with it.', {
				status: 400
			});
		}
		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			return new Response('Incorrect username or password', { status: 400 });
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		return new Response(null, {
			status: 302,
			headers: {
				location: '/'
			}
		});
	} catch (error) {
		console.error(error);
		return new Response('Internal server error', { status: 500 });
	}
};
