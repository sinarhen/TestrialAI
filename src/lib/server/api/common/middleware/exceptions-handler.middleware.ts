import { container, injectable } from 'tsyringe';
import { ConfigService } from '../configs/config.service';
import type { Context, ErrorHandler } from 'hono';
import { z } from 'zod';
import { HTTPException } from 'hono/http-exception';

@injectable()
export class CustomErrorHandler {
	constructor(private configService = container.resolve(ConfigService)) {
		this.configService = configService;
	}

	handle: ErrorHandler = (err: Error | HTTPException, c: Context) => {
		console.log('=== Caught Error ===');
		if (err instanceof HTTPException) {
			return c.text(err.message, err.status);
		}
		if (err instanceof z.ZodError) {
			return c.text(err.errors.map((err) => err.message).join(',\n'), 400);
		}
		console.error(err);
		return c.text('Something went wrong', 500);
	};
}
