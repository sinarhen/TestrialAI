import { container, injectable } from 'tsyringe';
import axios from 'axios';
import {
	BadRequest,
	Forbidden,
	InternalError,
	Unauthorized
} from '@/server/api/common/utils/exceptions';
import { UsersService } from '@/server/api/users/users.service';
import { BaseExternalLoginProviderService } from '../external-login-provider.service';
import { SessionsService } from '../../sessions/sessions.service';

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
export class GitHubLoginService extends BaseExternalLoginProviderService {
	private OAUTH_URL = 'https://github.com/login/oauth/authorize';
	private SCOPE = 'read:user user:email';

	constructor(
		private usersService = container.resolve(UsersService),
		private sessionService = container.resolve(SessionsService)
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
			console.dir({
				storedState,
				state
			});
			throw Unauthorized('Invalid state');
		}
		const { accessToken } = await this.validateAuthorizationCode(code);
		const githubUser = await this.getUserData(accessToken);
		const existingUser = await this.usersService.findUserByProviderId('github', githubUser.id);
		if (existingUser) {
			return this.sessionService.createSession(existingUser.id);
		} else {
			const existingUserByUsername = await this.usersService.getUserByUsername(githubUser.login);
			if (existingUserByUsername) {
				throw BadRequest('User with this username already exists');
			}
			const existingUserByEmail = await this.usersService.findUserByEmail(githubUser.email);
			if (existingUserByEmail) {
				throw BadRequest('User with this email already exists');
			}
			const userGitHubEmails = await this.getUserEmails(accessToken);

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
		const githubEmailResponse = await axios.get('https://api.github.com/user/emails', {
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
		const githubUserResponse = await axios.get<GitHubUser>('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${accessToken}`
			}
		});

		if (!githubUserResponse.data) {
			throw Forbidden('Invalid token');
		}
		const githubUser = githubUserResponse.data;
		return githubUser;
	}

	private async validateAuthorizationCode(code: string) {
		const qs = this.constructQs<GitHubGetAccessTokenQueryParams>({
			code,
			client_id: this.clientId,
			client_secret: this.clientSecret,
			redirect_uri: this.callbackUrl
		});

		const resp = await axios.post<GitHubAccessTokenResponse>(
			`https://github.com/login/oauth/access_token?${qs}`,
			{},
			{
				headers: {
					Accept: 'application/json'
				}
			}
		);

		const accessToken = resp.data.access_token;

		if (!resp.data || !accessToken) {
			console.log(accessToken);
			throw Forbidden('Invalid code');
		}

		return { accessToken };
	}

	private get clientSecret() {
		return this.configService.envs.GITHUB_CLIENT_SECRET;
	}

	private get callbackUrl() {
		return `${this.configService.envs.BASE_URL}/api/iam/login/github/callback`;
	}

	private get clientId() {
		return this.configService.envs.GITHUB_CLIENT_ID;
	}

	// private get redirectUrl() {
	// 	return `${this.configService.envs.BASE_URL}/api/iam/login/github/callback`;
	// }
}
