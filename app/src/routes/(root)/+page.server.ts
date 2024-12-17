import * as auth from '@/server/auth';
import { type Actions, fail, redirect } from '@sveltejs/kit';
import { db } from '@/server/db';
import * as table from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import { hash, verify } from '@node-rs/argon2';
import { encodeBase32LowerCase } from '@oslojs/encoding';
import { generateSurvey } from '@/server/openai/presets/generateSurvey';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => ({ user: event.locals.user });

export const actions: Actions = {
	startGeneration: async ({
		request
							}) => {
		// if (!event.locals.session) {
		// 	return redirect(302, '/');
		// }
		// const { prompt } = event.request.json();
		// if (!prompt) {
		// 	return fail(400, { prompt: 'Prompt is required' });
		// }

		const data = await request.formData();
		const topic = data.get('topic');
		if (!topic || typeof topic !== 'string') {
			return fail(400, { prompt: 'Topic is required' });
		}

		try {
			const response = await generateSurvey({
				topic,
				difficulty: 3,
				numberOfQuestions: 5,
			});
			return {
				generationResult: response
			};
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An error has occurred while generating.' });
		}

	},
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

		const results = await db.select().from(table.user).where(eq(table.user.username, username));

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
			await db.select().from(table.user).where(eq(table.user.username, username))
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
			await db.insert(table.user).values({ id: userId, username, passwordHash });

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

function generateUserId() {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	return encodeBase32LowerCase(bytes);
}

function validateUsername(username: unknown): username is string {
	return (
		typeof username === 'string' &&
		username.length >= 3 &&
		username.length <= 31 &&
		/^[a-z0-9_-]+$/.test(username)
	);
}

function validatePassword(password: unknown): password is string {
	return typeof password === 'string' && password.length >= 6 && password.length <= 255;
}
