import { DrizzleRepository } from '@api/common/factories/drizzle-repository.factory';
import type { CreateQuestionDto } from '@api/questions/dtos/create-question.dto';
import { questionsTable } from '@api/questions/tables/questions.table';
import {
	type Client,
	takeFirst,
	takeFirstOrThrow,
	type Transaction
} from '@api/common/utils/drizzle';
import { eq } from 'drizzle-orm';
import type { UpdateQuestionDto } from '@api/questions/dtos/update-question.dto';

export class QuestionsRepository extends DrizzleRepository {
	create(value: CreateQuestionDto, testId: string, db: Transaction | Client = this.drizzle.db) {
		return db
			.insert(questionsTable)
			.values({
				...value,
				testId
			})
			.returning()
			.then(takeFirst);
	}

	findOneByIdIncludeTest(id: string, db: Transaction | Client = this.drizzle.db) {
		return db.query.questionsTable.findFirst({
			where: eq(questionsTable.id, id),
			with: {
				test: true
			}
		});
	}

	findOneByIdOrThrow(id: string, db: Transaction | Client = this.drizzle.db) {
		return db.select().from(questionsTable).where(eq(questionsTable.id, id)).then(takeFirstOrThrow);
	}

	findQuestionsByTestId(testId: string, db: Transaction | Client = this.drizzle.db) {
		return db.select().from(questionsTable).where(eq(questionsTable.testId, testId));
	}

	createMultiple(
		questions: CreateQuestionDto[],
		testId: string,
		db: Transaction | Client = this.drizzle.db
	) {
		return db.insert(questionsTable).values(
			questions.map((q) => ({
				...q,
				testId
			}))
		);
	}

	updateQuestion(
		id: string,
		question: UpdateQuestionDto,
		db: Transaction | Client = this.drizzle.db
	) {
		return db
			.update(questionsTable)
			.set(question)
			.where(eq(questionsTable.id, id))
			.returning()
			.then(takeFirst);
	}
}
