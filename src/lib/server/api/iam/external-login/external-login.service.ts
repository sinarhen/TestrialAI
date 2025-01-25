import { inject, injectable } from '@needle-di/core';
import { GitHubLoginService } from './providers/github/github-login.service';
import { GoogleLoginService } from './providers/google/google-login.service';
import type { Provider } from '../../users/tables';
import type { BaseExternalLoginService } from './providers/external-login-provider.service';

injectable();
export class ExternalLoginService {
	constructor(
		private gitHubLoginService = inject(GitHubLoginService),
		private googleLoginService = inject(GoogleLoginService)
	) {}

	public getProviderService(provider: Provider): BaseExternalLoginService {
		if (provider === 'github') {
			return this.gitHubLoginService;
		}
		if (provider === 'google') {
			return this.googleLoginService;
		}
		throw new Error('Invalid provider');
	}
}
