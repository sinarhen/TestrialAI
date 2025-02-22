import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../../common/utils/crypto';
import { usersTable } from '../../users/tables/users.table';
import { testSessionsTable } from './testSessions.table';
import { relations, sql } from 'drizzle-orm';
import type { InferResultType } from '../../common/utils/drizzle';
import { testSessionParticipantStatuses } from '../../../../shared/constants/participant-statuses';
import { participantAnswersTable } from './participantsAnswers.table';

export const testSessionParticipantsTable = sqliteTable('test_participant', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateId()),
	testSessionId: text('test_session_id')
		.notNull()
		.references(() => testSessionsTable.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		// .notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' }),
	anonymousUserId: text('anonymous_user_id'),
	name: text('name').notNull(),
	status: text('status', {
		enum: testSessionParticipantStatuses
	}).notNull(),
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
		user: one(usersTable, {
			fields: [testSessionParticipantsTable.userId],
			references: [usersTable.id]
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
