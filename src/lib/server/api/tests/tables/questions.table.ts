import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../../common/utils/crypto';
import { testsTable } from './tests.table';
import { optionsTable } from './options.table';
import { relations, type InferSelectModel } from 'drizzle-orm';
import type { InferResultType } from '@/server/api/common/utils/drizzle';

export const questionsTable = sqliteTable('questions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateId()),
	question: text('question').notNull(),
	codeBlock: text('code_block'),
	codeLang: text('code_lang'),
	// .$type<entities.SupportedLanguage>(),
	answerType: text('answer_type').notNull(),
	// .$type<entities.AnswerType>(),
	correctAnswer: text('correct_answer'),
	answerExplanation: text('answer_explanation'),
	testId: text('test_id')
		.notNull()
		.references(() => testsTable.id, { onDelete: 'cascade' })
});

export const questionRelations = relations(questionsTable, ({ one, many }) => ({
	test: one(testsTable, {
		fields: [questionsTable.testId],
		references: [testsTable.id]
	}),
	options: many(optionsTable)
}));

export type Question = InferSelectModel<typeof questionsTable>;
export type QuestionWithRelations = InferResultType<
	'questionsTable',
	{
		test: true;
		options: true;
	}
>;
