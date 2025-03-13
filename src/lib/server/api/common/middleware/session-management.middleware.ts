import type { MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';
import { SessionsService } from '../../auth/sessions/user/sessions.service';
import { container } from 'tsyringe';
import { ParticipantSessionsService } from '../../auth/sessions/participant/participant-sessions.service';

export const sessionManagement: MiddlewareHandler = createMiddleware(async (c, next) => {
	const sessionService = container.resolve(SessionsService);
	const participantSessionService = container.resolve(ParticipantSessionsService);

	const participantSessionId = await participantSessionService.getParticipantSessionCookie();
	if (participantSessionId) {
		const participantSession =
			await participantSessionService.validateSession(participantSessionId);
		if (!participantSession) {
			participantSessionService.deleteParticipantSessionCookie();
		} else {
			c.set(participantSessionService.sessionCookieName, participantSession);
		}
	} else {
		c.set(participantSessionService.sessionCookieName, null);
	}

	const sessionId = await sessionService.getSessionCookie();

	if (!sessionId) {
		c.set(sessionService.sessionCookieName, null);
		return next();
	}

	const session = await sessionService.validateSession(sessionId);

	// If the session is not found, delete the cookie
	if (!session) {
		sessionService.deleteSessionCookie();
	} else {
		sessionService.setSessionCookie(session);
	}
	// Set the session in the context
	c.set(sessionService.sessionCookieName, session);

	// Continue to the next middleware
	return next();
});
