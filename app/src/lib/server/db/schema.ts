import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { sql } from 'drizzle-orm/sql/sql';
import { type AnswerType, type Difficulty } from '@/types/entities';

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

	difficulty: text('difficulty').notNull().$type<Difficulty>(),
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
	answerType: text('answer_type').notNull().$type<AnswerType>(),
	correctAnswer: text('correct_answer'),
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
