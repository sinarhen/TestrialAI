import { injectable } from '@needle-di/core';
import { z } from 'zod';
import * as envs from '$env/static/private';
import { envsDto, type EnvsDto } from './dtos/env.dto';

@injectable()
export class ConfigService {
	envs: EnvsDto & {
		BASE_URL: string;
	};

	constructor() {
		this.envs = this.initEnvs();

		// TODO: Find a better way to set the base url
		this.envs.BASE_URL =
			this.envs.ENV === 'dev' ? this.envs.PUBLIC_DEV_BASE_URL : this.envs.PUBLIC_PROD_BASE_URL;
	}

	private initEnvs() {
		const parsedEnvs = envsDto.parse(envs);

		const baseUrl =
			parsedEnvs.ENV === 'dev' ? parsedEnvs.PUBLIC_DEV_BASE_URL : parsedEnvs.PUBLIC_PROD_BASE_URL;

		return { ...parsedEnvs, BASE_URL: baseUrl };
	}

	validateEnvs() {
		try {
			return envsDto.parse(envs);
		} catch (err) {
			if (err instanceof z.ZodError) {
				const { fieldErrors } = err.flatten();
				const errorMessage = Object.entries(fieldErrors)
					.map(([field, errors]) => (errors ? `${field}: ${errors.join(', ')}` : field))
					.join('\n  ');
				throw new Error(`Missing environment variables:\n  ${errorMessage}`);
			}
		}
	}
}
