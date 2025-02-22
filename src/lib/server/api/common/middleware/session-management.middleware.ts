import type { MiddlewareHandler } from 'hono';
import { createMiddleware } from 'hono/factory';
import { SessionsService } from '../../iam/sessions/auth/sessions.service';
import { container } from 'tsyringe';

export const sessionManagement: MiddlewareHandler = createMiddleware(async (c, next) => {
	const sessionService = container.resolve(SessionsService);
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
