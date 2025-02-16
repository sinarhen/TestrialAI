import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../../common/utils/crypto';
import { usersTable } from '../../users/tables/users.table';
import { testSessionsTable } from './testSessions.table';
import { relations } from 'drizzle-orm';
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
	name: text('name').notNull(),
	status: text('status', {
		enum: testSessionParticipantStatuses
	}).notNull(),
	score: integer('score').notNull().default(0),
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
export type TestParticipantWithRelations = InferResultType<
	'testSessionParticipantsTable',
	{
		testSession: true;
		user: true;
	}
>;
