import { sql, relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../../common/utils/crypto';
import { usersTable } from '../../users/tables/users.table';
import { questionsTable, type Question } from '../../questions/tables';
import { testSessionsTable, type TestSession } from '../../testSessions/tables';

export const testsTable = sqliteTable('tests', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateId()),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
		.$type<Date>(),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`)
		.$onUpdateFn(() => new Date())
		.$type<Date>(),

	title: text('title').notNull(),
	description: text('description'),
	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' })
});

export const testRelations = relations(testsTable, ({ one, many }) => ({
	user: one(usersTable, {
		fields: [testsTable.userId],
		references: [usersTable.id]
	}),
	questions: many(questionsTable),
	sessions: many(testSessionsTable)
}));

export type Test = typeof testsTable.$inferSelect;
export type InsertTest = typeof testsTable.$inferInsert;

export type TestWithRelations = Test & {
	questions: Question[];
	sessions: TestSession[];
};
