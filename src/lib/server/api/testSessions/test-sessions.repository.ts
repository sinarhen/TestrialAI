import { injectable } from 'tsyringe';
import { DrizzleRepository } from '../common/factories/drizzle-repository.factory';
import {
	participantAnswersTable,
	testSessionParticipantsTable,
	testSessionsTable,
	type CreateParticipantAnswer,
	type CreateTestSession
} from './tables';
import { takeFirst, type DrizzleClient, type DrizzleTransaction } from '../common/utils/drizzle';
import { and, eq, sql } from 'drizzle-orm';

@injectable()
export class TestSessionsRepository extends DrizzleRepository {
	async upsertParticipantAnswers(
		answers: CreateParticipantAnswer[],
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.insert(participantAnswersTable)
			.values(answers)
			.onConflictDoUpdate({
				target: [participantAnswersTable.questionId, participantAnswersTable.testParticipantId],
				set: {
					typedAnswer: sql`excluded.typed_answer`,
					selectedOptionIds: sql`excluded.selected_option_ids`,
					submittedAt: new Date()
				}
			});
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
		testSessionId: string,
		participantId: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db.query.testSessionsTable.findFirst({
			where: eq(testSessionsTable.id, testSessionId),
			with: {
				participants: {
					where: eq(testSessionParticipantsTable.id, participantId),
					with: {
						answers: true
					}
				}
			}
		});
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
