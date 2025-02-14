import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../../common/utils/crypto';
import { relations } from 'drizzle-orm';
import { testSessionParticipantsTable } from './testSessionParticipants.table';
import type { InferResultType } from '../../common/utils/drizzle';

export const participantAnswersTable = sqliteTable('participant_answers', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateId()),
	testParticipantId: text('test_participant_id')
		.notNull()
		.references(() => testSessionParticipantsTable.id, { onDelete: 'cascade' }),
	questionId: text('question_id').notNull(),
	selectedOptionIds: text('selected_option_ids', { mode: 'json' }).$type<string[]>(),
	score: integer('score').notNull().default(0),
	typedAnswer: text('typed_answer'),
	submittedAt: integer('submitted_at', { mode: 'timestamp' })
});

export const participantAnswersRelations = relations(participantAnswersTable, ({ one }) => ({
	participant: one(testSessionParticipantsTable, {
		fields: [participantAnswersTable.testParticipantId],
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
