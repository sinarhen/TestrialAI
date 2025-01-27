import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '@api/common/utils/crypto';
import { testsTable } from '@api/tests/tables';
import { relations, type InferSelectModel } from 'drizzle-orm';
import type { InferResultType } from '@api/common/utils/drizzle';
import type { SupportedLanguage } from '@api/common/constants/supported-codeblock-langs';
import type { AnswerType } from '@api/common/constants/question-answer-types';

export const questionsTable = sqliteTable('questions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateId()),
	question: text('question').notNull(),
	codeBlock: text('code_block'),
	codeLang: text('code_lang').$type<SupportedLanguage>(),
	answerType: text('answer_type').notNull().$type<AnswerType>(),
	correctAnswer: text('correct_answer'),
	answerExplanation: text('answer_explanation'),
	options: text('options', { mode: 'json' }),
	testId: text('test_id')
		.notNull()
		.references(() => testsTable.id, { onDelete: 'cascade' })
});

export const questionRelations = relations(questionsTable, ({ one }) => ({
	test: one(testsTable, {
		fields: [questionsTable.testId],
		references: [testsTable.id]
	})
	// options: many(optionsTable)
}));

export type Question = InferSelectModel<typeof questionsTable>;
export type QuestionWithRelations = InferResultType<
	'questionsTable',
	{
		test: true;
		// options: true;
	}
>;
