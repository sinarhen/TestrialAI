import { Hono } from 'hono';
import type { Session } from 'lucia';

export type HonoEnv = {
	Variables: {
		session: Session | null;
		browserSessionId: string;
		requestId: string;
	};
};

export function createHono() {
	return new Hono<HonoEnv>();
}
