import { container } from 'tsyringe';
import { getCookie, setCookie } from 'hono/cookie';
import { dev } from '$app/environment';
import { ConfigService } from '@/server/api/common/configs/config.service';
import { RequestContextService } from '@/server/api/common/services/request-context.service';
import type { SessionDto } from '../sessions/dtos/sessions.dto';

export abstract class BaseExternalLoginProviderService {
	private OAUTHSTATE_COOKIE_NAME = 'OAUTH_STATE';

	constructor(
		protected configService = container.resolve(ConfigService),
		private requestContextService = container.resolve(RequestContextService)
	) {}

	abstract getAuthorizationUrl(state: string): string;

	abstract handleCallback(code: string, state: string): Promise<SessionDto>;

	public getStateCookie() {
		return getCookie(this.requestContextService.getContext(), this.OAUTHSTATE_COOKIE_NAME);
	}

	public setStateCookie(state: string) {
		setCookie(this.requestContextService.getContext(), this.OAUTHSTATE_COOKIE_NAME, state, {
			httpOnly: true,
			secure: !dev,
			sameSite: 'lax',
			maxAge: 60 * 5
		});
	}

	protected constructQs<T extends Record<string, string>>(params: T) {
		return new URLSearchParams(params).toString();
	}
}
