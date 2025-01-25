import { inject, injectable } from '@needle-di/core';
import { zValidator } from '@hono/zod-validator';
import { createLoginRequestDto } from './login-requests/dtos/create-login-request.dto';
import { LoginRequestsService } from './login-requests/login-requests.service';
import { verifyLoginRequestDto } from './login-requests/dtos/verify-login-request.dto';
import { SessionsService } from './sessions/sessions.service';
import { authState } from '../common/middleware/auth.middleware';
import { Controller } from '../common/factories/controllers.factory';
import { userDto } from '../users/dtos/user.dto';
import { z } from 'zod';
import { generateState } from '../common/utils/crypto';
import { ExternalLoginService } from './external-login/external-login.service';

@injectable()
export class IamController extends Controller {
	constructor(
		private loginRequestsService = inject(LoginRequestsService),
		private sessionsService = inject(SessionsService),
		private externalLoginService = inject(ExternalLoginService)
	) {
		super();
	}

	routes() {
		return this.controller
			.post(
				'/login/request',
				authState('none'),
				zValidator('json', createLoginRequestDto),
				async (c) => {
					await this.loginRequestsService.sendVerificationCode(c.req.valid('json'));
					return c.json({ message: 'welcome' });
				}
			)
			.post(
				'/login/verify',
				authState('none'),
				zValidator('json', verifyLoginRequestDto),
				async (c) => {
					const session = await this.loginRequestsService.verify(c.req.valid('json'));
					await this.sessionsService.setSessionCookie(session);
					return c.json({ message: 'welcome' });
				}
			)
			.post('/logout', async (c) => {
				await this.sessionsService.invalidateSession('');
				this.sessionsService.deleteSessionCookie();
				return c.json({ message: 'logout' });
			})
			.get(
				'/login/:provider',
				authState('none'),
				zValidator('param', userDto.pick({ provider: true }).required()),
				(c) => {
					const provider = c.req.valid('param').provider;

					const providerService = this.externalLoginService.getProviderService(provider);
					const state = generateState();

					providerService.setStateCookie(state);

					return c.redirect(providerService.getAuthorizationUrl(state));
				}
			)
			.get(
				'/login/:provider/callback',
				authState('none'),
				zValidator('param', userDto.pick({ provider: true }).required()),
				zValidator('query', z.object({ code: z.string(), state: z.string() })),
				async (c) => {
					const provider = c.req.valid('param').provider;
					const { code, state } = c.req.valid('query');

					// Get required provider: Google, Github, etc... and handle the callback
					const providerService = this.externalLoginService.getProviderService(provider);

					const userId = await providerService.handleCallbackAndReturnUserId(code, state);
					const session = await this.sessionsService.createSession(userId);
					await this.sessionsService.setSessionCookie(session);

					return c.redirect('/');
				}
			);
	}
}
