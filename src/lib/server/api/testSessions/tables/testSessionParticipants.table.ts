import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '@api/common/utils/crypto';
import { usersTable } from '@api/users/tables';
import { testSessionsTable } from './testSessions.table';
import { relations } from 'drizzle-orm';
import type { InferResultType } from '@/server/api/common/utils/drizzle';

export const testParticipantsTable = sqliteTable('test_participant', {
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
	status: text(
		'status'
		//     {
		// 	enum: entities.testSessionParticipantStatuses
		// }
	).notNull(),
	score: integer('score').notNull().default(0),
	feedback: text('feedback')
});

export const testSessionParticipantRelations = relations(testParticipantsTable, ({ one }) => ({
	testSession: one(testSessionsTable, {
		fields: [testParticipantsTable.testSessionId],
		references: [testSessionsTable.id]
	}),
	user: one(usersTable, {
		fields: [testParticipantsTable.userId],
		references: [usersTable.id]
	})
}));

export type TestParticipant = typeof testParticipantsTable.$inferSelect;
export type TestParticipantWithRelations = InferResultType<
	'testParticipantsTable',
	{
		testSession: true;
		user: true;
	}
>;
