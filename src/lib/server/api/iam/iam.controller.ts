import { inject, injectable } from '@needle-di/core';
import { zValidator } from '@hono/zod-validator';
import { createRegisterRequestDto } from './register-requests/dtos/create-register-request.dto';
import { RegisterRequestsService } from './register-requests/register-requests.service';
import { SessionsService } from './sessions/sessions.service';
import { authState } from '../common/middleware/auth.middleware';
import { Controller } from '../common/factories/controllers.factory';
import { userDto } from '../users/dtos/user.dto';
import { z } from 'zod';
import { generateState } from '../common/utils/crypto';
import { ExternalLoginService } from './external-login/external-login.service';
import { loginDto } from './register-requests/dtos/verify-register-request.dto';

@injectable()
export class IamController extends Controller {
	constructor(
		private loginRequestsService = inject(RegisterRequestsService),
		private sessionsService = inject(SessionsService),
		private externalLoginService = inject(ExternalLoginService)
	) {
		super();
	}

	routes() {
		return this.controller
			.post(
				'/register/request',
				authState('none'),
				zValidator('json', createRegisterRequestDto),
				async (c) => {
					await this.loginRequestsService.sendVerificationCode(c.req.valid('json'));
					return c.json({ message: 'Please check your email for the verification code' });
				}
			)
			.post('/register/verify', authState('none'), zValidator('json', verifyRequ), async (c) => {
				const session = await this.loginRequestsService.verify(c.req.valid('json'));
				await this.sessionsService.setSessionCookie(session);
				return c.json({ message: 'welcome' });
			})
			.post('/login', authState('none'), zValidator('json', loginDto), async (c) => {
				const session = await this.loginRequestsService.verify(c.req.valid('json'));
				await this.sessionsService.setSessionCookie(session);
				return c.json({ message: 'welcome' });
			})
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

					const providerService = this.externalLoginService.getProviderService(provider);

					const session = await providerService.handleCallback(code, state);
					await this.sessionsService.setSessionCookie(session);

					return c.redirect('/');
				}
			);
	}
}
