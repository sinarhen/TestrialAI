import { db } from '@/server/db';
import { users } from '@/server/db/schema';
import { google, lucia } from '@/server/lucia/auth';
import type { RequestHandler } from '@sveltejs/kit';
import { OAuth2RequestError } from 'arctic';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';

interface GoogleUser {
	sub: string;
	name: string;
	email: string;
	given_name: string;
	family_name: string;
}

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const codeVerifier = event.cookies.get('google_oauth_code_verifier');
	const storedState = event.cookies.get('google_oauth_state');

	if (!code || !state || !codeVerifier || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		const tokens = await google.validateAuthorizationCode(code, codeVerifier);
		const googleUserResponse = await fetch('https://www.googleapis.com/auth/userinfo.profile', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const googleUser: GoogleUser = await googleUserResponse.json();
		console.log(googleUser);
		const existingUser = await db.query.users.findFirst({
			where: and(eq(users.providerId, googleUser.sub), eq(users.provider, 'google'))
		});

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} else {
			const userId = generateId(40);
			await db.insert(users).values({
				id: userId,
				provider: 'google',
				providerId: googleUser.sub,
				username: googleUser.name,
				// username: googleUser.login,
				// firstName: nameParts[0] ?? '',
				// lastName: nameParts[1] ?? '',
				email: googleUser.email
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		return new Response(null, {
			status: 200
		});
	} catch (error) {
		console.error(error);
		if (error instanceof OAuth2RequestError) {
			return new Response(null, {
				status: 400
			});
		}
		return new Response(null, {
			status: 500
		});
	}
};
