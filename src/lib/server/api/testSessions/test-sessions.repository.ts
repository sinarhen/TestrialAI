import { injectable } from 'tsyringe';
import { DrizzleRepository } from '../common/factories/drizzle-repository.factory';
import { testSessionsTable, type CreateTestSession } from './tables';
import { takeFirst, type DrizzleClient, type DrizzleTransaction } from '../common/utils/drizzle';
import { eq } from 'drizzle-orm';

@injectable()
export class TestSessionsRepository extends DrizzleRepository {
	async createTestSession(
		testSession: CreateTestSession,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		// TODO: Analyze need to return the entire test session / just the code|id`
		return db.insert(testSessionsTable).values(testSession).returning().then(takeFirst);
	}

	async getTestSession(
		testSessionId: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.select()
			.from(testSessionsTable)
			.where(eq(testSessionsTable.id, testSessionId))
			.then(takeFirst);
	}

	async getTestSessionByCode(
		code: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.select()
			.from(testSessionsTable)
			.where(eq(testSessionsTable.code, code))
			.then(takeFirst);
	}
}
