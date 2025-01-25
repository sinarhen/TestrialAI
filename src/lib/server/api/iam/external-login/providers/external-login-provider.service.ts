import { inject } from '@needle-di/core';
import { getSignedCookie, setSignedCookie } from 'hono/cookie';
import { dev } from '$app/environment';
import { ConfigService } from '@/server/api/common/configs/config.service';
import { RequestContextService } from '@/server/api/common/services/request-context.service';
import type { SessionDto } from '../../sessions/dtos/sessions.dto';

export abstract class BaseExternalLoginService {
	abstract OAUTHSTATE_COOKIE_NAME: string;

	constructor(
		protected configService = inject(ConfigService),
		private requestContextService = inject(RequestContextService)
	) {}

	abstract getAuthorizationUrl(state: string): string;

	abstract handleCallback(code: string, state: string): Promise<SessionDto>;

	public getStateCookie() {
		return getSignedCookie(
			this.requestContextService.getContext(),
			this.OAUTHSTATE_COOKIE_NAME,
			this.configService.envs.SIGNING_SECRET
		);
	}

	public setStateCookie(state: string) {
		this.setAuthorizationCookie(this.OAUTHSTATE_COOKIE_NAME, state);
	}

	protected constructQs<T extends Record<string, string>>(params: T) {
		return new URLSearchParams(params).toString();
	}

	private setAuthorizationCookie(name: string, value: string) {
		setSignedCookie(
			this.requestContextService.getContext(),
			name,
			value,
			this.configService.envs.SIGNING_SECRET,
			{
				path: '/',
				httpOnly: true,
				secure: !dev,
				maxAge: 60 * 5,
				sameSite: 'lax'
			}
		);
	}
}
