import type { MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';
import type { SessionDto } from '@/server/api/auth/sessions/user/dtos/sessions.dto';
import { Unauthorized } from '../utils/exceptions';
import type { ParticipantSessionDto } from '../../auth/sessions/participant/dtos/participant-session.dto';

/* ---------------------------------- Types --------------------------------- */
type AuthStates = 'session' | 'none' | 'participant-session';
type AuthedReturnType = typeof authed;
type UnauthedReturnType = typeof unauthed;
type ParticipantAuthedReturnType = typeof participantAuthed;
/* ------------------- Overloaded function implementation ------------------- */
// we have to overload the implementation to provide the correct return type
export function authState(state: 'session'): AuthedReturnType;
export function authState(state: 'none'): UnauthedReturnType;
export function authState(state: 'participant-session'): ParticipantAuthedReturnType;

export function authState(
	state: AuthStates
): AuthedReturnType | UnauthedReturnType | ParticipantAuthedReturnType {
	if (state === 'session') return authed;
	if (state === 'participant-session') return participantAuthed;
	return unauthed;
}

/* ------------------------------ Require Auth ------------------------------ */
const authed: MiddlewareHandler<{
	Variables: {
		session: SessionDto;
	};
}> = createMiddleware(async (c, next) => {
	if (!c.var.session) {
		throw Unauthorized('You must be logged in to access this resource');
	}
	return next();
});

/* ---------------------------- Require Unauthed ---------------------------- */
const unauthed: MiddlewareHandler<{
	Variables: {
		session: null;
	};
}> = createMiddleware(async (c, next) => {
	if (c.var.session) {
		throw Unauthorized('You must be logged out to access this resource');
	}
	return next();
});

/* ----------------------------- Participant Authed ----------------------------- */
const participantAuthed: MiddlewareHandler<{
	Variables: {
		session?: SessionDto;
		'participant-session': ParticipantSessionDto;
	};
}> = createMiddleware(async (c, next) => {
	console.log('participantAuthed', c.var);
	if (!c.var.session && !c.var['participant-session']) {
		throw Unauthorized('You must be logged in or a participant to access this resource');
	}
	return next();
});
