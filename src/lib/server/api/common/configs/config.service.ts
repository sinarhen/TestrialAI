import { injectable } from '@needle-di/core';
import { z } from 'zod';
import * as privateEnvs from '$env/static/private';
import * as publicEnvs from '$env/static/public';
import {
	privateEnvsDto,
	publicEnvsDto,
	type PrivateEnvsDto,
	type PublicEnvsDto
} from './dtos/env.dto';

@injectable()
export class ConfigService {
	envs: PrivateEnvsDto & PublicEnvsDto & { BASE_URL?: string };

	constructor() {
		this.envs = this.initEnvs();

		// TODO: Find a better way to set the base url
		this.envs.BASE_URL =
			this.envs.ENV === 'dev' ? this.envs.PUBLIC_DEV_BASE_URL : this.envs.PUBLIC_PROD_BASE_URL;
	}

	private initEnvs() {
		const parsedPrivateEnvs = privateEnvsDto.parse(privateEnvs);
		const parsedPublicEnvs = publicEnvsDto.parse(publicEnvs);

		const baseUrl =
			parsedPrivateEnvs.ENV === 'dev'
				? parsedPublicEnvs.PUBLIC_DEV_BASE_URL
				: parsedPublicEnvs.PUBLIC_PROD_BASE_URL;

		return { ...parsedPrivateEnvs, ...parsedPublicEnvs, BASE_URL: baseUrl };
	}

	validateEnvs() {
		try {
			return { ...privateEnvsDto.parse(privateEnvs), ...publicEnvsDto.parse(publicEnvs) };
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
