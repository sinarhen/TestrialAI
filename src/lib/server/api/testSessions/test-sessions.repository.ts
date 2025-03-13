import { injectable } from 'tsyringe';
import { DrizzleRepository } from '../common/factories/drizzle-repository.factory';
import {
	testSessionParticipantsTable,
	testSessionsTable,
	type CreateTestSession,
	type TestParticipantInsert
} from './tables';
import { takeFirst, type DrizzleClient, type DrizzleTransaction } from '../common/utils/drizzle';
import { and, eq } from 'drizzle-orm';

@injectable()
export class TestSessionsRepository extends DrizzleRepository {
	async updateTestSessionParticipant(
		participantId: string,
		participant: Partial<TestParticipantInsert>,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.update(testSessionParticipantsTable)
			.set(participant)
			.where(eq(testSessionParticipantsTable.participantId, participantId))
			.returning()
			.then(takeFirst);
	}

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
		return db.query.testSessionsTable.findFirst({
			where: eq(testSessionsTable.id, testSessionId),
			with: {
				participants: true
			}
		});
	}

	async getTestSessionWithParticipantAnswers(
		testSessionCode: string,
		participantId: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db.query.testSessionsTable.findFirst({
			where: eq(testSessionsTable.code, testSessionCode),
			with: {
				participants: {
					where: eq(testSessionParticipantsTable.participantId, participantId),
					with: {
						answers: true
					}
				}
			}
		});
	}

	async addParticipantToTestSession(
		participantId: string,
		testSessionId: string,
		name: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.insert(testSessionParticipantsTable)
			.values({
				participantId,
				status: 'IN_PROGRESS',
				testSessionId,
				name
			})
			.returning()
			.then(takeFirst);
	}

	async abandonParticipantInTestSession(
		testSessionId: string,
		participantId: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.update(testSessionParticipantsTable)
			.set({ status: 'ABANDONED' })
			.where(
				and(
					eq(testSessionParticipantsTable.testSessionId, testSessionId),
					eq(testSessionParticipantsTable.participantId, participantId)
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
