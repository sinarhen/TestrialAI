import { generateCodeVerifier, generateState } from 'arctic';
import type { RequestEvent } from './$types';
import { google } from '@/server/lucia/auth';
import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
export async function GET(event: RequestEvent) {
	const state = generateState();
	const codeVerifier = generateCodeVerifier();
	const url = await google.createAuthorizationURL(state, codeVerifier, [
		'openid',
		'profile',
		'email'
	]);

	event.cookies.set('google_oauth_state', state, {
		path: '/',
		httpOnly: true,
		secure: !dev,
		maxAge: 60 * 5,
		sameSite: 'lax'
	});

	event.cookies.set('google_oauth_code_verifier', codeVerifier, {
		path: '/',
		httpOnly: true,
		secure: !dev,
		maxAge: 60 * 5,
		sameSite: 'lax'
	});

	return redirect(302, url.toString());
}
