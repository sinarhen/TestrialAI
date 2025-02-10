import { injectable } from 'tsyringe';
import { DrizzleRepository } from '@api/common/factories/drizzle-repository.factory';

@injectable()
export class DrizzleTransactionService extends DrizzleRepository {
	runTransaction(...args: Parameters<typeof this.drizzle.db.transaction>) {
		return this.drizzle.db.transaction(...args);
	}
}
