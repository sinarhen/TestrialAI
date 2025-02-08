import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { generateId } from '../../common/utils/crypto';
import { testsTable, type TestWithRelations } from '../../tests/tables';
import { relations } from 'drizzle-orm';
import { testParticipantsTable } from './testSessionParticipants.table';
import type { InferResultType } from '../../common/utils/drizzle';
import { displayModes } from '../../../../constants/display-modes';

export const testSessionsTable = sqliteTable(
	'test_sessions',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => generateId()),
		testId: text('test_id')
			.notNull()
			.references(() => testsTable.id, { onDelete: 'cascade' }),
		code: text('code')
			.unique()
			.notNull()
			.$defaultFn(() => Math.random().toString(36).slice(2, 8)),
		startTime: integer('start_time', { mode: 'timestamp' }),
		endTime: integer('end_time', { mode: 'timestamp' }),
		durationInMinutes: integer('duration_in_minutes'),
		testStateJson: text('test_state_json', {
			mode: 'json'
		})
			.$type<TestWithRelations>()
			.notNull(),
		displayMode: text('display_mode', {
			enum: displayModes
		}).notNull()
	},
	(table) => ({
		codeIdx: uniqueIndex('code_idx').on(table.code)
	})
);

export const testSessionRelations = relations(testSessionsTable, ({ many }) => ({
	participants: many(testParticipantsTable)
}));

export type TestSession = typeof testSessionsTable.$inferSelect;
export type CreateTestSession = typeof testSessionsTable.$inferInsert;
export type TestSessionWithRelations = InferResultType<
	'testSessionsTable',
	{
		participants: true;
		test: true;
	}
>;
