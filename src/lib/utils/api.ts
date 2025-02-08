import type { ApiRoutes } from '$lib/server/api';
import type { ClientRequestOptions } from 'hono';
import { hc, type ClientResponse } from 'hono/client';
export const honoClient = (baseUrl: string, options?: ClientRequestOptions) =>
	hc<ApiRoutes>(baseUrl, options).api;

export async function parseClientResponse<T>(response: ClientResponse<T>): Promise<
	| {
			data: T;
			error: null;
	  }
	| {
			data: null;
			error: string;
	  }
> {
	console.error('response', response);
	if (!response.ok) {
		const res = await response.text();
		return { data: null, error: res };
	}

	const res = await response.json();
	return { data: res as T, error: null };
}
