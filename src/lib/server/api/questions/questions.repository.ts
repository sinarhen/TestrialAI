import { DrizzleRepository } from '@api/common/factories/drizzle-repository.factory';
import type { CreateQuestionDto } from '@api/questions/dtos/create-question.dto';
import { questionsTable } from '@api/questions/tables/questions.table';
import { takeFirst } from '@api/common/utils/drizzle';
import { eq } from 'drizzle-orm';

export class QuestionsRepository extends DrizzleRepository {
	create(value: CreateQuestionDto, testId: string, db = this.drizzle.db) {
		return db
			.insert(questionsTable)
			.values({
				...value,
				testId
			})
			.returning()
			.then(takeFirst);
	}

	findQuestionsByTestId(testId: string, db = this.drizzle.db) {
		return db.select().from(questionsTable).where(eq(questionsTable.testId, testId));
	}

	createMultiple(questions: CreateQuestionDto[], testId: string, db = this.drizzle.db) {
		return db.insert(questionsTable).values(
			questions.map((q) => ({
				...q,
				testId
			}))
		);
	}
}
