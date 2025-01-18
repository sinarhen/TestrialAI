import { dev } from '$app/environment';

import { Lucia } from 'lucia';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '../db';
import { sessions, users } from '../db/schema';
import {
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$env/static/private';
import { GitHub, Google } from 'arctic';

const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
const redirectUrl = {
	github: `${baseUrl}/auth/github/callback`,
	google: `${baseUrl}/auth/google/callback`
};

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, redirectUrl.github);
export const google = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, redirectUrl.google);

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);
export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (data) => {
		return {
			firstName: data.firstName,
			lastName: data.lastName,
			username: data.username,
			provider: data.provider,
			providerId: data.providerId,
			email: data.email
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			firstName: string;
			lastName: string;
			username: string;
			provider: string;
			providerId: string;
			email: string;
		};
	}
}
