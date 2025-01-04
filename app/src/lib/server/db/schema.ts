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
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const surveys = sqliteTable('surveys', {
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
	userId: text('user_id').notNull()
});

export const questions = sqliteTable('questions', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv4()),
	question: text('question').notNull(),
	answerType: text('answer_type').notNull().$type<AnswerType>(), // 'single' | 'multiple' | 'text'
	// For text-based answers:
	correctAnswer: text('correct_answer'),
	// If the question is multiple-choice, `correctAnswer` might be null.
	surveyId: text('survey_id').notNull()
});

export const options = sqliteTable('options', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => uuidv4()),
	questionId: text('question_id').notNull(),
	value: text('value').notNull(),
	isCorrect: integer('is_correct', { mode: 'boolean' }).notNull().default(false) // 0 = false, 1 = true
});

export const userRelations = relations(users, ({ many }) => ({
	surveys: many(surveys),
	sessions: many(sessions)
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

export const surveyRelations = relations(surveys, ({ one, many }) => ({
	user: one(users, {
		fields: [surveys.userId],
		references: [users.id]
	}),
	questions: many(questions)
}));

export const questionRelations = relations(questions, ({ one, many }) => ({
	survey: one(surveys, {
		fields: [questions.surveyId],
		references: [surveys.id]
	}),
	options: many(options) // Adds a relation to option
}));

export const optionRelations = relations(options, ({ one }) => ({
	question: one(questions, {
		fields: [options.questionId],
		references: [questions.id]
	})
}));
