import { honoClient } from '@/utils/api';
import type { ClientRequestOptions } from 'hono';

export abstract class RequestOptions {
	protected readonly opts: ClientRequestOptions | undefined;
	protected readonly api: ReturnType<typeof honoClient>;

	constructor(opts?: ClientRequestOptions) {
		this.opts = opts;
		this.api = honoClient(opts);
	}
}
