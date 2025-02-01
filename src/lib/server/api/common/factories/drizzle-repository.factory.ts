import { container } from 'tsyringe';
import { DrizzleService } from '../../db/libsql/drizzle.server';

export abstract class DrizzleRepository {
	public readonly drizzle: DrizzleService;

	constructor() {
		this.drizzle = container.resolve(DrizzleService);
	}
}
