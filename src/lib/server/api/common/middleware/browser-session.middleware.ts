import type { MiddlewareHandler } from 'hono';
import { getSignedCookie, setSignedCookie } from 'hono/cookie';
import { createMiddleware } from 'hono/factory';
import { container } from 'tsyringe';
import { ConfigService } from '../configs/config.service';
import { generateId } from '../utils/crypto';

export const browserSessions: MiddlewareHandler = createMiddleware(async (c, next) => {
	const BROWSER_SESSION_COOKIE_NAME = '_id';
	const configService = container.resolve(ConfigService);
	const browserSessionCookie = await getSignedCookie(
		c,
		configService.envs.SIGNING_SECRET,
		BROWSER_SESSION_COOKIE_NAME
	);
	let browserSessionId = browserSessionCookie;

	if (!browserSessionCookie) {
		browserSessionId = generateId();
		setSignedCookie(
			c,
			BROWSER_SESSION_COOKIE_NAME,
			browserSessionId,
			configService.envs.SIGNING_SECRET,
			{
				httpOnly: true,
				sameSite: 'lax',
				secure: configService.envs.ENV === 'prod',
				path: '/'
			}
		);
	}

	c.set('browserSessionId', browserSessionId);
	return next();
});
