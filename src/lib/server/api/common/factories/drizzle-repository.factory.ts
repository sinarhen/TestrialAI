import { container } from 'tsyringe';
import { DrizzleService } from '../../db/libsql/drizzle.server';

export abstract class DrizzleRepository {
	protected readonly drizzle: DrizzleService;

	constructor() {
		this.drizzle = container.resolve(DrizzleService);
	}

	get runTransaction() {
		return this.drizzle.db.transaction;
	}
}
