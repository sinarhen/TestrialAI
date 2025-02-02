import { container, injectable } from 'tsyringe';
import { ConfigService } from '../configs/config.service';
import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';

@injectable()
export class CustomErrorHandler {
	constructor(private configService = container.resolve(ConfigService)) {
		this.configService = configService;
	}

	handle: ErrorHandler = (err) => {
		if (err instanceof HTTPException) {
			if (this.configService.envs.ENV === 'dev') {
				const message = `${err.status} ${err.message}\n${err.stack}\n${err.stack}`;
				return new Response(message, { status: err.status });
			}
			return err.getResponse();
		}

		console.dir(err);
		return new Response('Unexpected error', { status: 500 });
	};
}
