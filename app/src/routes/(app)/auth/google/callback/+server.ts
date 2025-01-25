import { google, lucia } from '@/server/lucia/auth';
import { ObjectParser } from '@pilcrowjs/object-parser';
import type { RequestHandler } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';


export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const codeVerifier = event.cookies.get('google_oauth_code_verifier');
	const storedState = event.cookies.get('google_oauth_state');

	if (!code || !state || !codeVerifier || !storedState || state !== storedState) {
		return new Response('Unauthorized', {
			status: 400
		});
	}

	try {
		let tokens: OAuth2Tokens;
		try {
			tokens = await google.validateAuthorizationCode(code, codeVerifier);
		} catch (e) {
			return new Response('Please restart the process.', {
				status: 400
			});
		}

		const claims = decodeIdToken(tokens.idToken());
		const claimsParser = new ObjectParser(claims);

		const googleId = claimsParser.getString('sub');
		const name = claimsParser.getString('name');
		// const picture = claimsParser.getString('picture');
		const email = claimsParser.getString('email');
		const givenName = claimsParser.getString('given_name');
		const familyName = claimsParser.getString('family_name');
		// const googleUserResponse = await fetch('https://www.googleapis.com/auth/userinfo.profile', {
		// 	headers: {
		// 		Authorization: `Bearer ${tokens.accessToken()}`
		// 	}
		// });

		// const googleUser: GoogleUser = await googleUserResponse.json();
		const existingUser = await db.query.users.findFirst({
			where: and(eq(users.providerId, googleId), eq(users.provider, 'google'))
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
				providerId: googleId,
				username: name,
				firstName: givenName,
				lastName: familyName,
				email: email
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		}
		return new Response(null, {
			status: 302,
			headers: { location: '/' }
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
