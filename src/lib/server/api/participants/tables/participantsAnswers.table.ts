import { integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { generateId } from '../../common/utils/crypto';
import { relations } from 'drizzle-orm';
import { testSessionParticipantsTable } from '../../testSessions/tables/testSessionParticipants.table';
import type { InferResultType } from '../../common/utils/drizzle';

export const participantAnswersTable = sqliteTable(
	'participant_answers',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => generateId()),
		questionId: text('question_id').notNull(),
		testSessionParticipantId: text('test_session_participant_id')
			.notNull()
			.references(() => testSessionParticipantsTable.id, { onDelete: 'cascade' }),
		typedAnswer: text('typed_answer'),
		selectedOptionIds: text('selected_option_ids', { mode: 'json' }).$type<string[]>(),
		submittedAt: integer('submitted_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
		score: integer('score').default(0)
	},
	(table) => ({
		uniqueAnswer: uniqueIndex('unique_participant_answer').on(
			table.questionId,
			table.testSessionParticipantId
		)
	})
);

export const participantAnswersRelations = relations(participantAnswersTable, ({ one }) => ({
	participant: one(testSessionParticipantsTable, {
		fields: [participantAnswersTable.testSessionParticipantId],
		references: [testSessionParticipantsTable.id]
	})
}));

export type ParticipantAnswer = typeof participantAnswersTable.$inferSelect;
export type CreateParticipantAnswer = typeof participantAnswersTable.$inferInsert;
export type ParticipantAnswerWithRelations = InferResultType<
	'participantAnswersTable',
	{
		participant: true;
		// participantAnswerOptions: true;
	}
>;
