import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '@/server/db';
import { eq } from 'drizzle-orm';
import { testSessions } from '@/server/db/schema';

import * as auth from '@/server/auth';
import { type Actions, fail, redirect } from '@sveltejs/kit';
import * as table from '@/server/db/schema';
import { hash, verify } from '@node-rs/argon2';
import { generateUserId, validatePassword, validateUsername } from '@/utils/auth';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { sessionCode } = params;
	if (!sessionCode) {
		return error(404, 'Session not found');
	}

	const session = await db.query.testSessions.findFirst({
		where: eq(testSessions.code, sessionCode),
		with: {
			participants: true,
			test: {
				with: {
					user: {
						columns: {
							username: true
						}
					}
				}
			}
		}
	});

	if (!session) {
		return error(404, 'Session not found');
	}

	return {
		session,
		user: locals.user
	};
};

export const actions: Actions = {
	logout: async (event) => {
		if (!event.locals.session) {
			return redirect(302, '/');
		}
		await auth.invalidateSession(event.locals.session.id);
		auth.deleteSessionTokenCookie(event);

		return;
	},
	login: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, { username: 'Invalid username' });
		}
		if (!validatePassword(password)) {
			return fail(400, { password: 'Invalid password' });
		}

		const results = await db.select().from(table.users).where(eq(table.users.username, username));

		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { message: 'Incorrect username or password' });
		}

		const validPassword = await verify(existingUser.passwordHash, password, {
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});
		if (!validPassword) {
			return fail(400, { password: 'Incorrect username or password' });
		}

		const sessionToken = auth.generateSessionToken();
		const session = await auth.createSession(sessionToken, existingUser.id);
		auth.setSessionTokenCookie(event, sessionToken, session.expiresAt);

		return { success: true };
	},
	register: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (!validateUsername(username)) {
			return fail(400, { username: 'Invalid username' });
		}
		if (!validatePassword(password)) {
			return fail(400, { password: 'Password must be between 6 and 255 characters' });
		}
		const existingUser = (
			await db.select().from(table.users).where(eq(table.users.username, username))
		).at(0);
		if (existingUser) {
			return fail(400, { username: 'Username already exists' });
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
			return fail(500, { message: 'An error has occurred' });
		}
		return { success: true };
	}
};
