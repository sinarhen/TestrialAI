// import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
// import { generateId } from '../../common/utils/crypto';
// import { questionsTable } from '@api/questions/tables/questions.table';
// import { relations, type InferSelectModel } from 'drizzle-orm';
// import type { InferResultType } from '@/server/api/common/utils/drizzle';
//
// export const optionsTable = sqliteTable('options', {
// 	id: text('id')
// 		.primaryKey()
// 		.$defaultFn(() => generateId()),
// 	questionId: text('question_id')
// 		.notNull()
// 		.references(() => questionsTable.id, { onDelete: 'cascade' }),
// 	value: text('value').notNull(),
// 	isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false)
// });
//
// export const optionRelations = relations(optionsTable, ({ one }) => ({
// 	question: one(questionsTable, {
// 		fields: [optionsTable.questionId],
// 		references: [questionsTable.id]
// 	})
// }));
//
// export type Option = InferSelectModel<typeof optionsTable>;
// export type OptionWithRelations = InferResultType<
// 	'optionsTable',
// 	{
// 		question: true;
// 	}
// >;
