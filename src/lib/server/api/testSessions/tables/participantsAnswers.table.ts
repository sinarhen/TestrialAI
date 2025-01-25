import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../../common/utils/crypto';
import { relations } from 'drizzle-orm';
import { testParticipantsTable } from './testSessionParticipants.table';
import { participantAnswerOptionsTable } from './participantsAnswerOptions';
import type { InferResultType } from '@/server/api/common/utils/drizzle';

export const participantAnswersTable = sqliteTable('participant_answers', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateId()),
	testParticipantId: text('test_participant_id')
		.notNull()
		.references(() => testParticipantsTable.id, { onDelete: 'cascade' }),
	questionId: text('question_id').notNull(),
	// selectedOptionId: text('selected_option_id'),
	typedAnswer: text('typed_answer'),
	submittedAt: integer('submitted_at', { mode: 'timestamp' })
});

export const participantAnswersRelations = relations(participantAnswersTable, ({ one, many }) => ({
	participant: one(testParticipantsTable, {
		fields: [participantAnswersTable.testParticipantId],
		references: [testParticipantsTable.id]
	}),
	participantAnswerOptions: many(participantAnswerOptionsTable)
}));

export type ParticipantAnswer = typeof participantAnswersTable.$inferSelect;
export type ParticipantAnswerWithRelations = InferResultType<
	'participantAnswersTable',
	{
		participant: true;
		participantAnswerOptions: true;
	}
>;
