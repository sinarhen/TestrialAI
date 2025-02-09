import { injectable } from 'tsyringe';
import { DrizzleRepository } from '../common/factories/drizzle-repository.factory';
import { testSessionParticipantsTable, testSessionsTable, type CreateTestSession } from './tables';
import { takeFirst, type DrizzleClient, type DrizzleTransaction } from '../common/utils/drizzle';
import { and, eq } from 'drizzle-orm';

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

	async addParticipantToTestSession(
		testSessionId: string,
		name: string,
		userId?: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.insert(testSessionParticipantsTable)
			.values({ name, userId, testSessionId, status: 'IN_PROGRESS' })
			.returning()
			.then(takeFirst);
	}

	async abandonParticipantInTestSession(
		testSessionId: string,
		userId: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.update(testSessionParticipantsTable)
			.set({ status: 'ABANDONED' })
			.where(
				and(
					eq(testSessionParticipantsTable.testSessionId, testSessionId),
					eq(testSessionParticipantsTable.userId, userId)
				)
			)
			.returning()
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
