import { container, injectable } from 'tsyringe';
import { Unauthorized } from '@/server/api/common/utils/exceptions';
import axios from 'axios';
import { UsersService } from '@/server/api/users/users.service';
import { BaseExternalLoginProviderService } from '../external-login-provider.service';
import { SessionsService } from '../../sessions/auth/sessions.service';

type GoogleAuthorizeQueryParams = {
	client_id: string;
	redirect_uri: string;
	state: string;
	response_type: 'code';
	scope: string;
};

type GoogleGetAccessTokenQueryParams = {
	client_id: string;
	client_secret: string;
	code: string;
	grant_type: string;
	redirect_uri: string;
};

type GoogleAccessTokenResponse = {
	access_token: string;
	expires_in: number;
	token_type: string;
	scope: string;
	id_token: string;
};
type GoogleUser = {
	sub: string;
	name: string;
	email: string;
	given_name: string;
	family_name: string;
};

@injectable()
export class GoogleLoginService extends BaseExternalLoginProviderService {
	private GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
	private GET_ACCESS_TOKEN_URL = 'https://oauth2.googleapis.com/token';
	private SCOPE = 'openid profile email';

	constructor(
		private usersService = container.resolve(UsersService),
		private sessionService = container.resolve(SessionsService)
	) {
		super();
	}

	getAuthorizationUrl(state: string): string {
		const callbackUrl = `${this.configService.envs.BASE_URL}/auth/google/callback`;
		const qs = this.constructQs<GoogleAuthorizeQueryParams>({
			client_id: this.configService.envs.GOOGLE_CLIENT_ID,
			redirect_uri: callbackUrl,
			state,
			response_type: 'code',
			scope: this.SCOPE
		});

		return `${this.GOOGLE_OAUTH_URL}?${qs}`;
	}

	async handleCallback(code: string, state: string) {
		const storedState = await this.getStateCookie();

		if (!storedState || state !== storedState) {
			throw Unauthorized('Invalid state or code verifier');
		}

		const { access_token } = await this.validateAuthorizationCode(code);

		const googleUserResponse = await this.getUserInfo(access_token);
		const existingUser = await this.usersService.findUserByProviderId(
			'google',
			googleUserResponse.sub
		);

		if (existingUser) {
			return this.sessionService.createSession(existingUser.id);
		} else {
			const createdUser = await this.usersService.create({
				provider: 'google',
				providerId: googleUserResponse.sub,
				username: googleUserResponse.name,
				firstName: googleUserResponse.given_name,
				lastName: googleUserResponse.family_name,
				email: googleUserResponse.email
			});
			if (!createdUser) {
				throw Unauthorized('Failed to create user');
			}
			return this.sessionService.createSession(createdUser.id);
		}
	}

	private async validateAuthorizationCode(code: string) {
		const qs = this.constructQs<GoogleGetAccessTokenQueryParams>({
			client_id: this.clientId,
			client_secret: this.clientSecret,
			code,
			grant_type: 'authorization_code',
			redirect_uri: this.redirectUrl
		});

		const response = await axios.post<GoogleAccessTokenResponse>(
			`${this.GET_ACCESS_TOKEN_URL}?${qs}`
		);
		if (response.status !== 200) {
			throw Unauthorized('Invalid code');
		}

		return response.data;
	}

	private async getUserInfo(accessToken: string) {
		const response = await axios.get<GoogleUser>(
			'https://www.googleapis.com/auth/userinfo.profile',
			{
				headers: {
					Authorization: `Bearer ${accessToken}`
				}
			}
		);

		if (response.status !== 200) {
			throw Unauthorized('Failed to get user info');
		}

		return response.data;
	}

	private get clientSecret() {
		return this.configService.envs.GOOGLE_CLIENT_SECRET;
	}

	private get redirectUrl() {
		return `${this.configService.envs.BASE_URL}/auth/google/callback`;
	}

	private get clientId() {
		return this.configService.envs.GOOGLE_CLIENT_ID;
	}
}
