import { injectable } from '@needle-di/core';
import { usersTable, type Provider } from './tables/users.table';
import { eq,and } from 'drizzle-orm';
import { NotFound } from '../common/utils/exceptions';
import { DrizzleRepository } from '../common/factories/drizzle-repository.factory';
import type { CreateUserDto } from './dtos/create-user.dto';
import type { UpdateUserDto } from './dtos/update-user.dto';

@injectable()
export class UsersRepository extends DrizzleRepository {
	async findOneById(id: string, db = this.drizzle.db) {
		return (await db.select().from(usersTable).where(eq(usersTable.id, id))).at(0);
	}

	async findOneByEmail(email: string, db = this.drizzle.db) {
		return (await db.select().from(usersTable).where(eq(usersTable.email, email))).at(0);
	}

	async findOneByProvider(provider: Provider, providerId: string, db = this.drizzle.db) {
		return (await db.select().from(usersTable).where(and(eq(usersTable.providerId, providerId), eq(usersTable.provider, provider))).limit(1)).at(0);
	}

	async findOneByIdOrThrow(id: string, db = this.drizzle.db) {
		const user = await this.findOneById(id, db);
		if (!user) throw NotFound('User not found');
		return user;
	}

	async update(id: string, data: UpdateUserDto, db = this.drizzle.db) {
		return (await db.update(usersTable).set(data).where(eq(usersTable.id, id)).returning()).at(0);
	}

	async create(data: CreateUserDto, db = this.drizzle.db) {
		return (await db.insert(usersTable).values(data).returning()).at(0);
	}
}
