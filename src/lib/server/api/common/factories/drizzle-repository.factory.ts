import { Container } from '@needle-di/core';
import { DrizzleService } from '../../db/libsql/drizzle.server';

export abstract class DrizzleRepository {
	public readonly drizzle: DrizzleService;

	constructor() {
		this.drizzle = new Container().get(DrizzleService);
	}
}
