import type { InferRequestType } from 'hono';
import { TanstackRequestOptions } from '../request-options';
import type { Api, ApiMutation } from '@/utils/types';
import { parseClientResponse } from '@/utils/api';

export type RequestLogin = Api['iam']['login']['request']['$post'];
export type VerifyLogin = Api['iam']['login']['verify']['$post'];
export type Logout = Api['iam']['logout']['$post'];

export class IamModule extends TanstackRequestOptions {
	namespace = 'iam';

	logout(): ApiMutation<Logout> {
		return {
			mutationFn: async () => await this.api.iam.logout.$post().then(parseClientResponse)
		};
	}
	requestLogin(): ApiMutation<RequestLogin> {
		return {
			mutationFn: async (data: InferRequestType<RequestLogin>) =>
				await this.api.iam.login.request.$post(data).then(parseClientResponse)
		};
	}
	verifyLogin(): ApiMutation<VerifyLogin> {
		return {
			mutationFn: async (data: InferRequestType<VerifyLogin>) =>
				await this.api.iam.login.verify.$post(data).then(parseClientResponse)
		};
	}
}