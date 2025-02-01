import { getContext } from 'hono/context-storage';
import { injectable } from 'tsyringe';
import type { HonoEnv } from '../utils/hono';

@injectable()
export class RequestContextService {
	getContext() {
		return getContext<HonoEnv>();
	}

	getRequestId(): string {
		return this.getContext().get('requestId');
	}

	getAuthedUserId() {
		return this.getContext().get('session')?.userId;
	}

	getSession() {
		return this.getContext().get('session');
	}
}
