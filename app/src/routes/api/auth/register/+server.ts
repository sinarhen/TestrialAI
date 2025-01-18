import { db } from '@/server/db';
import { generateUserId, validatePassword, validateUsername } from '@/utils/auth';
import { hash } from '@node-rs/argon2';
import type { RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import * as table from '@/server/db/schema';
import * as auth from '@/server/auth';

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
	const existingUser = (
		await db.select().from(table.users).where(eq(table.users.username, username))
	).at(0);
	if (existingUser) {
		return new Response('User already exists', { status: 400 });
	}
	const userId = generateUserId();
	const passwordHash = await hash(password, {
		// recommended minimum parameters
		memoryCost: 19456,
		timeCost: 2,
		outputLen: 32,
		parallelism: 1
	});

	try {
		await db.insert(table.users).values({ id: userId, username, passwordHash });

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, userId);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);
	} catch (e) {
		console.log(e);
		return new Response('Internal server error', { status: 500 });
	}
	return new Response('User created', { status: 200 });
};
