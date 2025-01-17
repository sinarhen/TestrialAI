import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sql } from 'drizzle-orm/sql/sql';
import * as entities from '../../types/entities';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const sessions = sqliteTable('sessions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv4()),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const testSessions = sqliteTable(
	'test_sessions',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => uuidv4()),
		testId: text('test_id')
			.notNull()
			.references(() => tests.id, { onDelete: 'cascade' }),
		code: text('code')
			.unique()
			.notNull()
			.$defaultFn(() => Math.random().toString(36).slice(2, 8)),
		startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
		endTime: integer('end_time', { mode: 'timestamp' }),
		durationInMinutes: integer('duration_in_minutes'),
		testStateJson: text('test_state_json', {
			mode: 'json'
		})
			.$type<entities.Test>()
			.notNull(),
		displayMode: text('display_mode', {
			enum: entities.displayModes
		}).notNull()
	},
	(table) => ({
		codeIdx: uniqueIndex('code_idx').on(table.code)
	})
);

export const testParticipants = sqliteTable('test_participant', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv4()),
	testSessionId: text('test_session_id')
		.notNull()
		.references(() => testSessions.id, { onDelete: 'cascade' }),
	userId: text('user_id')
		// .notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	status: text('status', {
		enum: entities.testSessionParticipantStatuses
	}).notNull(),
	score: integer('score').notNull().default(0),
	feedback: text('feedback')
});

export const tests = sqliteTable('tests', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv4()),
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
		.references(() => users.id, { onDelete: 'cascade' })
});

export const questions = sqliteTable('questions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv4()),
	question: text('question').notNull(),
	codeBlock: text('code_block'),
	codeLang: text('code_lang').$type<entities.SupportedLanguage>(),
	answerType: text('answer_type').notNull().$type<entities.AnswerType>(),
	correctAnswer: text('correct_answer'),
	answerExplanation: text('answer_explanation'),
	testId: text('test_id')
		.notNull()
		.references(() => tests.id, { onDelete: 'cascade' })
});

export const options = sqliteTable('options', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv4()),
	questionId: text('question_id')
		.notNull()
		.references(() => questions.id, { onDelete: 'cascade' }),
	value: text('value').notNull(),
	isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false)
});

export const testSessionRelations = relations(testSessions, ({ one, many }) => ({
	participants: many(testParticipants),
	test: one(tests, {
		fields: [testSessions.testId],
		references: [tests.id]
	})
}));

export const testSessionParticipantRelations = relations(testParticipants, ({ one }) => ({
	testSession: one(testSessions, {
		fields: [testParticipants.testSessionId],
		references: [testSessions.id]
	}),
	user: one(users, {
		fields: [testParticipants.userId],
		references: [users.id]
	})
}));

export const userRelations = relations(users, ({ many }) => ({
	tests: many(tests),
	sessions: many(sessions)
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const testRelations = relations(tests, ({ one, many }) => ({
	user: one(users, {
		fields: [tests.userId],
		references: [users.id]
	}),
	questions: many(questions)
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
	test: one(tests, {
		fields: [questions.testId],
		references: [tests.id]
	}),
	options: many(options)
}));

export const optionRelations = relations(options, ({ one }) => ({
	question: one(questions, {
		fields: [options.questionId],
		references: [questions.id]
	})
}));
