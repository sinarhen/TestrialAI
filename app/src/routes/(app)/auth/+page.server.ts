import { db } from '@/server/db';
import { lucia } from '@/server/lucia/auth';
import { validateEmail, validatePassword, validateUsername } from '@/utils/auth';
import { fail, type Actions } from '@sveltejs/kit';
import * as table from '$lib/server/db/schema';
import { hash, verify } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';

export const actions: Actions = {
	logout: async ({ locals, cookies }) => {
		if (!locals.session) return fail(401);
		await lucia.invalidateSession(locals.session?.id);

		const sessionCookie = lucia.createBlankSessionCookie();
		if (!sessionCookie) return fail(500);
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		return { success: true };
	},
	login: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const password = formData.get('password');
		if (!validateEmail(email)) {
			return fail(400, { email: 'Invalid email' });
		}
		if (!validatePassword(password)) {
			return fail(400, { password: 'Invalid password' });
		}
		const results = await db.select().from(table.users).where(eq(table.users.email, email));
		const existingUser = results.at(0);
		if (!existingUser) {
			return fail(400, { message: 'Incorrect email or password' });
		}
		if (!existingUser.passwordHash) {
			return fail(400, {
				message: 'You are signed in with an external provider. Please sign in with it.'
			});
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

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
		return { success: true };
	},
	register: async (event) => {
		const formData = await event.request.formData();
		const email = formData.get('email');
		const username = formData.get('username');
		const firstName = formData.get('firstName');
		const lastName = formData.get('lastName');
		const password = formData.get('password');

		if (!validateEmail(email)) {
			return fail(400, { email: 'Invalid email' });
		}
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
		try {
			const userId = generateId(40);
			const passwordHash = await hash(password, {
				// recommended minimum parameters
				memoryCost: 19456,
				timeCost: 2,
				outputLen: 32,
				parallelism: 1
			});
			await db.insert(table.users).values({
				id: userId,
				email: email?.toString(),
				username,
				firstName: firstName?.toString(),
				lastName: lastName?.toString(),
				passwordHash
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
			return { success: true };
		} catch (e) {
			console.log(e);
			return fail(500, { message: 'An error has occurred' });
		}
	}
};
