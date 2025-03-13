import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../../common/utils/crypto';
import { testSessionsTable } from './testSessions.table';
import { relations, sql } from 'drizzle-orm';
import type { InferResultType } from '../../common/utils/drizzle';
import { testSessionParticipantStatuses } from '../../../../shared/constants/participant-statuses';
import { participantAnswersTable } from '../../participants/tables/participantsAnswers.table';
import { participantsTable } from '../../participants/tables/participantsTable';

export const testSessionParticipantsTable = sqliteTable('test_participant', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateId()),
	participantId: text('participant_id')
		.notNull()
		.references(() => participantsTable.id, { onDelete: 'cascade' }),
	testSessionId: text('test_session_id')
		.notNull()
		.references(() => testSessionsTable.id, { onDelete: 'cascade' }),
	status: text('status', {
		enum: testSessionParticipantStatuses
	}).notNull(),
	name: text('name').notNull(),
	score: integer('score').notNull().default(0),
	submittedAt: integer('submitted_at', { mode: 'timestamp' }).default(sql`CURRENT_TIMESTAMP`),
	startedAt: integer('started_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`CURRENT_TIMESTAMP`),
	feedback: text('feedback')
});

export const testSessionParticipantRelations = relations(
	testSessionParticipantsTable,
	({ one, many }) => ({
		testSession: one(testSessionsTable, {
			fields: [testSessionParticipantsTable.testSessionId],
			references: [testSessionsTable.id]
		}),
		participant: one(participantsTable, {
			fields: [testSessionParticipantsTable.participantId],
			references: [participantsTable.id]
		}),
		answers: many(participantAnswersTable)
	})
);

export type TestParticipant = typeof testSessionParticipantsTable.$inferSelect;
export type TestParticipantInsert = typeof testSessionParticipantsTable.$inferInsert;
export type TestParticipantWithRelations = InferResultType<
	'testSessionParticipantsTable',
	{
		testSession: true;
		user: true;
	}
>;
