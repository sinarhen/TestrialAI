import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { generateId } from '../../common/utils/crypto';
import { usersTable } from '../../users/tables/users.table';
import { relations } from 'drizzle-orm';

export const participantsTable = sqliteTable('participants', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => generateId()),
	userId: text('user_id').references(() => usersTable.id, { onDelete: 'cascade' })
});
export const participantsTableRelations = relations(participantsTable, ({ one }) => ({
	user: one(usersTable, {
		fields: [participantsTable.userId],
		references: [usersTable.id]
	})
}));
