import { sql, relations } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../../common/utils/crypto';
import { usersTable } from '../../users/tables/users.table';
import { questionsTable } from '../../questions/tables/questions.table';
import type { InferResultType } from '../../common/utils/drizzle';

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
	description: text('description').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id, { onDelete: 'cascade' })
});

export const testRelations = relations(testsTable, ({ one, many }) => ({
	user: one(usersTable, {
		fields: [testsTable.userId],
		references: [usersTable.id]
	}),
	questions: many(questionsTable)
}));

export type Test = typeof testsTable.$inferSelect;
export type InsertTest = typeof testsTable.$inferInsert;

export type TestWithRelations = InferResultType<
	'testsTable',
	{
		user: true;
		questions: true;
	}
>;
