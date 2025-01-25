import { inject, injectable } from '@needle-di/core';
import { setSignedCookie } from 'hono/cookie';
import { dev } from '$app/environment';
import { ConfigService } from '@/server/api/common/configs/config.service';
import { RequestContextService } from '@/server/api/common/services/request-context.service';

type GitHubProviderQueryParams = 
{
		client_id: string;
		redirect_uri: string;
		state: string;
		scope: string;
	};

@injectable()
export class GitHubLoginService {
	private OAUTH_URL = 'https://github.com/login/oauth/authorize';

	constructor(
		private configService = inject(ConfigService),
		private requestContextService = inject(RequestContextService)
	) {}

	getAuthorizationUrl(state: string) {
		const callbackUrl = `${this.configService.envs.BASE_URL}/auth/github/callback`;

		const qs = this.constructProviderAuthUrlQs({
			client_id: this.configService.envs.GITHUB_CLIENT_ID,
			redirect_uri: callbackUrl,
			state,
			scope: 'user:email'
		});

		return `${this.OAUTH_URL}?${qs}`;
	}

	setStateCookie(state: string) {
		return setSignedCookie(
			this.requestContextService.getContext(),
			'github_oauth_state',
			state,
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

	private async constructProviderAuthUrlQs(
		params: GitHubProviderQueryParams
	) {
		return new URLSearchParams(params).toString();
	}
}
