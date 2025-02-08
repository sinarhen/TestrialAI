import { DrizzleRepository } from '@api/common/factories/drizzle-repository.factory';
import { testsTable } from '@api/tests/tables';
import {
	type DrizzleClient,
	takeFirstOrThrow,
	type DrizzleTransaction
} from '@api/common/utils/drizzle';
import { eq } from 'drizzle-orm';
import { injectable } from 'tsyringe';
import type { CreateTestDto } from './dtos/create-test-dto';

@injectable()
export class TestsRepository extends DrizzleRepository {
	async createTest(
		test: CreateTestDto,
		userId: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.insert(testsTable)
			.values({ ...test, userId })
			.returning()
			.then(takeFirstOrThrow);
	}

	async findAllByUserId(userId: string, db: DrizzleTransaction | DrizzleClient = this.drizzle.db) {
		return db.query.testsTable.findMany({
			where: eq(testsTable.userId, userId),
			with: {
				questions: true
			}
		});
	}

	async findOneById(id: string, db: DrizzleTransaction | DrizzleClient = this.drizzle.db) {
		return db.select().from(testsTable).where(eq(testsTable.id, id));
	}

	async findOneByIdOrThrow(id: string, db: DrizzleTransaction | DrizzleClient = this.drizzle.db) {
		return await this.findOneById(id, db).then(takeFirstOrThrow);
	}

	async findOneByIdIncludeQuestions(
		id: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db.query.testsTable.findFirst({
			where: eq(testsTable.id, id),
			with: {
				questions: true
			}
		});
	}

	async update(
		id: string,
		data: CreateTestDto,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.update(testsTable)
			.set(data)
			.where(eq(testsTable.id, id))
			.returning()
			.then(takeFirstOrThrow);
	}

	async delete(id: string, db = this.drizzle.db) {
		return db.delete(testsTable).where(eq(testsTable.id, id));
	}
}
