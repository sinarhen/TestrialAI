import { container, injectable } from 'tsyringe';
import { createRegisterRequestDto } from './dtos/register-requests/create-register-request.dto';
import { AuthService } from './auth.service';
import { SessionsService } from './sessions/user/sessions.service';
import { authState } from '../common/middleware/auth.middleware';
import { Controller } from '../common/factories/controllers.factory';
import { userDto } from '../users/dtos/user.dto';
import { z } from 'zod';
import { generateState } from '../common/utils/crypto';
import { verifyRegisterRequestDto } from './dtos/register-requests/verify-register-request.dto';
import { loginDto } from './dtos/login/login.dto';
import { zValidator } from '../common/utils/zod-validator-wrapper';

@injectable()
export class AuthController extends Controller {
	constructor(
		private authService = container.resolve(AuthService),
		private sessionsService = container.resolve(SessionsService)
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
					await this.authService.sendVerificationCode(c.req.valid('json').email);
					return c.json({ message: 'Please check your email for the verification code' });
				}
			)
			.post(
				'/register/verify',
				authState('none'),
				zValidator('json', verifyRegisterRequestDto),
				async (c) => {
					const session = await this.authService.verify(c.req.valid('json'));
					await this.sessionsService.setSessionCookie(session);
					return c.json({ message: 'welcome' });
				}
			)
			.post('/login', authState('none'), zValidator('json', loginDto), async (c) => {
				const session = await this.authService.login(c.req.valid('json'));
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
					const providerService = this.authService.getExternalProviderService(
						c.req.valid('param').provider
					);
					const state = generateState();
					providerService.setStateCookie(state);
					return c.redirect(providerService.getAuthorizationUrl(state));
				}
			)
			.get(
				'/login/:provider/callback',
				authState('none'),
				zValidator('param', z.object({ provider: userDto.required().shape.provider })),
				zValidator('query', z.object({ code: z.string(), state: z.string() })),
				async (c) => {
					const providerService = this.authService.getExternalProviderService(
						c.req.valid('param').provider
					);

					const { code, state } = c.req.valid('query');
					const session = await providerService.handleCallback(code, state);
					await this.sessionsService.setSessionCookie(session);

					return c.redirect('/');
				}
			);
	}
}
