import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull(),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const survey = sqliteTable('survey', {
	id: text('id').primaryKey(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	userId: text('user_id').notNull()
});

export const question = sqliteTable('question', {
	id: text('id').primaryKey(),
	question: text('question').notNull(),
	answer: text('answer').notNull(),
	options: text('options').notNull().$default(() => '[]'),
	surveyId: text('survey_id').notNull()
});

export const userRelations = relations(user, ({ one, many }) => ({
	surveys: many(survey),
	sessions: many(session)
}));

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	})
}));

export const surveyRelations = relations(survey, ({ one, many }) => ({
	user: one(user, {
		fields: [survey.userId],
		references: [user.id]
	}),
	questions: many(question)
}));

export const questionRelations = relations(question, ({ one }) => ({
	survey: one(survey, {
		fields: [question.surveyId],
		references: [survey.id]
	})
}));