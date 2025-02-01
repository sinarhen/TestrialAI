import { injectable } from 'tsyringe';
import { usersTable, type Provider } from './tables/users.table';
import { eq, and } from 'drizzle-orm';
import { DrizzleRepository } from '../common/factories/drizzle-repository.factory';
import type { CreateUserDto } from './dtos/create-user.dto';
import type { UpdateUserDto } from './dtos/update-user.dto';
import { takeFirst, takeFirstOrThrow } from '../common/utils/drizzle';

@injectable()
export class UsersRepository extends DrizzleRepository {
	async findOneById(id: string, db = this.drizzle.db) {
		return db.select().from(usersTable).where(eq(usersTable.id, id));
	}

	async findOneByEmail(email: string, db = this.drizzle.db) {
		return db.select().from(usersTable).where(eq(usersTable.email, email)).then(takeFirst);
	}

	async findOneByProvider(provider: Provider, providerId: string, db = this.drizzle.db) {
		return db
			.select()
			.from(usersTable)
			.where(and(eq(usersTable.providerId, providerId), eq(usersTable.provider, provider)))
			.limit(1)
			.then(takeFirst);
	}

	async findOneByIdOrThrow(id: string, db = this.drizzle.db) {
		const user = await this.findOneById(id, db).then(takeFirstOrThrow);
		return user;
	}

	async update(id: string, data: UpdateUserDto, db = this.drizzle.db) {
		return db
			.update(usersTable)
			.set(data)
			.where(eq(usersTable.id, id))
			.returning()
			.then(takeFirstOrThrow);
	}

	async create(data: CreateUserDto, db = this.drizzle.db) {
		return db.insert(usersTable).values(data).returning().then(takeFirstOrThrow);
	}
}
