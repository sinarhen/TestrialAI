import { inject, injectable } from '@needle-di/core';
import { setSignedCookie } from 'hono/cookie';
import { dev } from '$app/environment';
import { ConfigService } from '@/server/api/common/configs/config.service';
import { RequestContextService } from '@/server/api/common/services/request-context.service';

type GoogleQueryParams = {
	client_id: string;
	redirect_uri: string;
	state: string;
	scope: string;
};

@injectable()
export class GoogleLoginService  {
	PROVIDER_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
	SCOPE = 'openid profile email';
    OAUTHSTATE_COOKIE_NAME = 'google_oauth_state';
    OAUTHCODEVERIFIER_COOKIE_NAME = 'google_oauth_code_verifier';

	constructor(
		private configService = inject(ConfigService),
		private requestContextService = inject(RequestContextService)
	) {
	}

	getAuthorizationUrl(state: string): string {
		const callbackUrl = `${this.configService.envs.BASE_URL}/auth/google/callback`;

		const qs = this.constructProviderAuthUrlQs<GoogleQueryParams>({
			client_id: this.configService.envs.GOOGLE_CLIENT_ID,
			redirect_uri: callbackUrl,
			state,
			scope: this.SCOPE
		});

		return `${this.PROVIDER_OAUTH_URL}?${qs}`;
	}
    
	setStateCookie(state: string) {
        this.setAuthorizationCookie(this.OAUTHSTATE_COOKIE_NAME, state);
	}

    setCodeVerifierCookie(code: string) {
        this.setAuthorizationCookie(this.OAUTHCODEVERIFIER_COOKIE_NAME, code);
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
        )};

    private constructProviderAuthUrlQs<TParams extends Record<string, string>>(params: TParams) {
		return new URLSearchParams(params).toString();
	}
}
