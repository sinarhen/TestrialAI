import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	age: integer('age'),
	username: text('username').notNull().unique(),
	passwordHash: text('password_hash').notNull()
});

export const session = sqliteTable('session', {
	id: text('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id),
	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const survey = sqliteTable('survey', {
	id: text('id').primaryKey(),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});


export const question = sqliteTable('question', {
	id: text('id').primaryKey(),
	question: text('question').notNull(),
	answer: text('answer').notNull(),
	options: text('options').notNull()
		.$default(() => '[]'),
	surveyId: text('survey_id')
		.notNull()
		.references(() => survey.id)
});