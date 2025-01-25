import { getTableColumns, relations, type InferSelectModel } from 'drizzle-orm';
import { primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { testsTable } from '../../tests/tables/tests.table';
import type { InferResultType } from '@/server/api/common/utils/drizzle';
import { generateId } from '../../common/utils/crypto';

const providers = ['google', 'github'] as const;
export type Provider = (typeof providers)[number];

export const usersTable = sqliteTable(
	'users',
	{
		id: text('id')
			.notNull()
			.$default(() => generateId()),

		provider: text('provider', {
			enum: providers
		}),
		providerId: text('provider_id', { length: 255 }),
		email: text('email'),
		username: text('username').notNull().unique(),
		firstName: text('first_name'),
		lastName: text('last_name'),
		passwordHash: text('password_hash')
	},
	(table) => ({
		pk: primaryKey({
			name: 'pk',
			columns: [table.id]
		}),
		providerIndex: uniqueIndex('provider_idx').on(table.provider, table.providerId)
	})
);
export const userRelations = relations(usersTable, ({ many }) => ({
	tests: many(testsTable)
}));

export type User = InferSelectModel<typeof usersTable>;
export type UserWithRelations = InferResultType<'usersTable', { tests: true }>;

const userColumns = getTableColumns(usersTable);

export const publicUserColumns = {
	id: userColumns.id,
	username: userColumns.username,
	firstName: userColumns.firstName,
	lastName: userColumns.lastName
};
