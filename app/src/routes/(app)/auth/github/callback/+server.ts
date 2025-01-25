import type { RequestHandler } from '@sveltejs/kit';
import { github, lucia } from '@/server/lucia/auth';
import { db } from '@/server/db';
import { and, eq } from 'drizzle-orm';
import { users } from '@/server/db/schema';
import { generateId } from 'lucia';
import { OAuth2RequestError } from 'arctic';

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	const storedState = event.cookies.get('github_oauth_state') ?? null;
	if (!code || !state || !storedState || state !== storedState) {
		console.log('code', code);
		console.log('state', state);
		console.log('storedState', storedState);

		return new Response(null, { status: 400 });
	}
	try {
		const tokens = await github.validateAuthorizationCode(code);
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken()}`
			}
		});

		const githubUser: GitHubUser = await githubUserResponse.json();

		const existingUser = await db.query.users.findFirst({
			where: and(eq(users.providerId, githubUser.id), eq(users.provider, 'github'))
		});

		if (existingUser) {
			const session = await lucia.createSession(existingUser.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			event.cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} else {
			const githubEmailResponse = await fetch('https://api.github.com/user/emails', {
				headers: {
					Authorization: `Bearer ${tokens.accessToken()}`
				}
			});

			const githubEmail: GitHubEmail[] = await githubEmailResponse.json();

			const primary = githubEmail.find((email) => email.primary && email.verified);
			if (primary) {
				const nameParts = githubUser.name.split(' ');
				const userId = generateId(40);
				await db.insert(users).values({
					id: userId,
					provider: 'github',
					providerId: githubUser.id,
					username: githubUser.login,
					firstName: nameParts[0] ?? '',
					lastName: nameParts[1] ?? '',
					email: primary.email
				});
				const session = await lucia.createSession(userId, {});
				const sessionCookie = lucia.createSessionCookie(session.id);
				event.cookies.set(sessionCookie.name, sessionCookie.value, {
					path: '.',
					...sessionCookie.attributes
				});
			}
		}

		return new Response(null, {
			status: 302,
			headers: { location: '/' }
		});
	} catch (e) {
		console.log(e);

		if (e instanceof OAuth2RequestError) {
			return new Response(null, { status: 400 });
		}
		return new Response(null, { status: 500 });
	}
};
