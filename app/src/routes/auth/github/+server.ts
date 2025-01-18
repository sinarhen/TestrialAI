import { generateState } from 'arctic';
import type { RequestEvent } from './$types';
import { github } from '@/server/lucia/auth';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';

export async function GET(event: RequestEvent) {
	const state = generateState();
	const url = await github.createAuthorizationURL(state, ['user:email']);

	event.cookies.set('github_oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: !dev,
		maxAge: 60 * 5,
		sameSite: 'lax'
	});

	return redirect(302, url.toString());
}
