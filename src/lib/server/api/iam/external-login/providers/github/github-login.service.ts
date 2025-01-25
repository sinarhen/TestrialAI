import { inject, injectable } from '@needle-di/core';
import axios from 'axios';
import { Forbidden, InternalError, Unauthorized } from '@/server/api/common/utils/exceptions';
import { UsersService } from '@/server/api/users/users.service';
import { BaseExternalLoginService } from '../external-login-provider.service';
import { SessionsService } from '../../../sessions/sessions.service';

type GitHubAuthorizeQueryParams = {
	client_id: string;
	redirect_uri: string;
	state: string;
	scope: string;
};

type GitHubGetAccessTokenQueryParams = {
	client_id: string;
	client_secret: string;
	code: string;
	redirect_uri: string;
};

type GitHubAccessTokenResponse = {
	access_token: string;
	token_type: string;
	scope: string;
};

interface GitHubUser {
	id: string;
	login: string;
	name: string;
	email: string;
	avatar_url: string;
}

type GitHubEmail = {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility: string;
};

@injectable()
export class GitHubLoginService extends BaseExternalLoginService {
	private OAUTH_URL = 'https://github.com/login/oauth/authorize';
	private SCOPE = 'user';
	OAUTHSTATE_COOKIE_NAME = 'github_oauth_state';

	constructor(
		private usersService = inject(UsersService),
		private sessionService = inject(SessionsService)
	) {
		super();
	}

	getAuthorizationUrl(state: string) {
		const qs = this.constructQs<GitHubAuthorizeQueryParams>({
			client_id: this.clientId,
			redirect_uri: this.callbackUrl,
			state,
			scope: this.SCOPE
		});

		return `${this.OAUTH_URL}?${qs}`;
	}

	async handleCallback(code: string, state: string) {
		const storedState = await this.getStateCookie();

		if (!storedState || state !== storedState) {
			throw Unauthorized('Invalid state');
		}
		const { access_token } = await this.validateAuthorizationCode(code);
		const githubUser = await this.getUserData(access_token);
		const existingUser = await this.usersService.getUserByProviderId('github', githubUser.id);

		if (existingUser) {
			return this.sessionService.createSession(existingUser.id);
		} else {
			const userGitHubEmails = await this.getUserEmails(access_token);

			const primary = userGitHubEmails.find((email) => email.primary && email.verified);
			if (primary) {
				const nameParts = githubUser.name.split(' ');
				const createdUser = await this.usersService.create({
					provider: 'github',
					providerId: githubUser.id,
					username: githubUser.login,
					firstName: nameParts[0] ?? '',
					lastName: nameParts[1] ?? '',
					email: primary.email
				});
				if (!createdUser) {
					throw InternalError('Failed to create user');
				}
				return this.sessionService.createSession(createdUser.id);
			}
		}
		throw InternalError('Failed to create or find user');
	}

	private async getUserEmails(accessToken: string) {
		const githubEmailResponse = await axios.post('https://api.github.com/user/emails', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (!githubEmailResponse.data) {
			throw Forbidden('Invalid token');
		}

		const githubEmail: GitHubEmail[] = await githubEmailResponse.data;
		return githubEmail;
	}

	private async getUserData(accessToken: string) {
		const githubUserResponse = await axios.post<GitHubUser>('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});
		if (!githubUserResponse.data) {
			throw Forbidden('Invalid token');
		}
		const githubUser: GitHubUser = await githubUserResponse.data;
		return githubUser;
	}

	private async validateAuthorizationCode(code: string) {
		const qs = this.constructQs<GitHubGetAccessTokenQueryParams>({
			code,
			client_id: this.clientId,
			client_secret: this.clientSecret,
			redirect_uri: this.redirectUrl
		});
		const resp = await axios.post<GitHubAccessTokenResponse>(
			`https://github.com/login/oauth/access_token?${qs}`,
			{
				headers: {
					Accept: 'application/json'
				}
			}
		);

		if (!resp.data || !resp.data.access_token) {
			throw Forbidden('Invalid code');
		}

		return resp.data;
	}

	private get clientSecret() {
		return this.configService.envs.GITHUB_CLIENT_SECRET;
	}

	private get callbackUrl() {
		return `${this.configService.envs.BASE_URL}/auth/github/callback`;
	}

	private get clientId() {
		return this.configService.envs.GITHUB_CLIENT_ID;
	}

	private get redirectUrl() {
		return `${this.configService.envs.BASE_URL}/auth/github/callback`;
	}
}
