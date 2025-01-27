import { injectable } from '@needle-di/core';
import { DrizzleRepository } from '@api/common/factories/drizzle-repository.factory';

@injectable()
export class DrizzleTransactionService extends DrizzleRepository {
	get runTransaction() {
		return this.drizzle.db.transaction;
	}
}
