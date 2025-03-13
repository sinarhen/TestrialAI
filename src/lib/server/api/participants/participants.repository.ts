import { injectable } from 'tsyringe';
import { DrizzleRepository } from '../common/factories/drizzle-repository.factory';
import { participantAnswersTable, type CreateParticipantAnswer } from '../testSessions/tables';
import { takeFirst, type DrizzleClient } from '../common/utils/drizzle';
import type { DrizzleTransaction } from '../common/utils/drizzle';
import { sql } from 'drizzle-orm';
import { participantsTable } from './tables';

@injectable()
export class ParticipantsRepository extends DrizzleRepository {
	async getOrCreateParticipant(
		participantId?: string,
		userId?: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.insert(participantsTable)
			.values({ id: participantId, userId })
			.onConflictDoUpdate({
				target: participantsTable.id,
				set: { id: participantId, userId }
			})
			.returning()
			.then(takeFirst);
	}

	// async getParticipantId(
	// 	participantId: string,
	// 	db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	// ) {
	// 	return db.query.participantsTable.findFirst({ where: eq(participantsTable.id, participantId) });
	// }

	async upsertParticipantAnswers(
		answers: CreateParticipantAnswer[],
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.insert(participantAnswersTable)
			.values(answers)
			.onConflictDoUpdate({
				target: [
					participantAnswersTable.questionId,
					participantAnswersTable.testSessionParticipantId
				],
				set: {
					typedAnswer: sql`excluded.typed_answer`,
					selectedOptionIds: sql`excluded.selected_option_ids`,
					submittedAt: new Date()
				}
			})
			.returning();
	}
}
