import { DrizzleRepository } from '@api/common/factories/drizzle-repository.factory';
import { testsTable } from '@api/tests/tables';
import { type Client, takeFirstOrThrow, type Transaction } from '@api/common/utils/drizzle';
import { eq } from 'drizzle-orm';
import type { CreateTestDto } from '@api/tests/dtos/test.dto';
import { injectable } from '@needle-di/core';

@injectable()
export class TestsRepository extends DrizzleRepository {
	async createTest(
		test: CreateTestDto,
		userId: string,
		db: Transaction | Client = this.drizzle.db
	) {
		return db
			.insert(testsTable)
			.values({ ...test, userId })
			.returning()
			.then(takeFirstOrThrow);
	}

	async findAllByUserId(userId: string, db: Transaction | Client = this.drizzle.db) {
		return db.select().from(testsTable).where(eq(testsTable.userId, userId));
	}

	async findOneById(id: string, db: Transaction | Client = this.drizzle.db) {
		return db.select().from(testsTable).where(eq(testsTable.id, id));
	}

	async findOneByIdOrThrow(id: string, db: Transaction | Client = this.drizzle.db) {
		return await this.findOneById(id, db).then(takeFirstOrThrow);
	}

	async findOneByIdIncludeQuestions(id: string, db: Transaction | Client = this.drizzle.db) {
		return db.query.testsTable.findFirst({
			where: eq(testsTable.id, id),
			with: {
				questions: true
			}
		});
	}

	async update(id: string, data: CreateTestDto, db: Transaction | Client = this.drizzle.db) {
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
