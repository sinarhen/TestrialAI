import { injectable } from 'tsyringe';
import { DrizzleRepository } from '@api/common/factories/drizzle-repository.factory';

// transaction<T>(transaction: (tx: SQLiteTransaction<TResultKind, TRunResult, TFullSchema, TSchema>) => Result<TResultKind, T>, config?: SQLiteTransactionConfig): Result<TResultKind, T>;

@injectable()
export class DrizzleTransactionService extends DrizzleRepository {
	runTransaction<T>(...args: Parameters<typeof this.drizzle.db.transaction<T>>): Promise<T> {
		return this.drizzle.db.transaction(...args);
	}
}
