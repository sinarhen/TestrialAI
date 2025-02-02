import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../../common/utils/crypto';
import { participantAnswersTable } from './participantsAnswers.table';
import { relations } from 'drizzle-orm';

export const participantAnswerOptionsTable = sqliteTable('participant_answer_options', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateId()),
	participantAnswerId: text('participant_answer_id')
		.notNull()
		.references(() => participantAnswersTable.id, { onDelete: 'cascade' }),
	optionId: text('option_id').notNull()
	// .references(() => optionsTable.id, { onDelete: 'cascade' })
});

export const participantAnswerOptionsRelations = relations(
	participantAnswerOptionsTable,
	({ one }) => ({
		participantAnswer: one(participantAnswersTable, {
			fields: [participantAnswerOptionsTable.participantAnswerId],
			references: [participantAnswersTable.id]
		})
	})
);

export type ParticipantAnswerOption = typeof participantAnswerOptionsTable.$inferSelect;
