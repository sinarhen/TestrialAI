import { DrizzleRepository } from '@api/common/factories/drizzle-repository.factory';
import type { CreateQuestionDto } from '@api/questions/dtos/create-question.dto';
import { questionsTable } from '@api/questions/tables/questions.table';
import {
	type DrizzleClient,
	takeFirst,
	takeFirstOrThrow,
	type DrizzleTransaction
} from '@api/common/utils/drizzle';
import { eq } from 'drizzle-orm';
import type { UpdateQuestionDto } from '@api/questions/dtos/update-question.dto';
import { injectable } from 'tsyringe';
import { generateId } from '../common/utils/crypto';

@injectable()
export class QuestionsRepository extends DrizzleRepository {
	create(
		value: CreateQuestionDto,
		testId: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.insert(questionsTable)
			.values({
				...value,
				testId
			})
			.returning()
			.then(takeFirst);
	}

	findOneByIdIncludeTest(id: string, db: DrizzleTransaction | DrizzleClient = this.drizzle.db) {
		return db.query.questionsTable.findFirst({
			where: eq(questionsTable.id, id),
			with: {
				test: true
			}
		});
	}

	findOneByIdOrThrow(id: string, db: DrizzleTransaction | DrizzleClient = this.drizzle.db) {
		return db.select().from(questionsTable).where(eq(questionsTable.id, id)).then(takeFirstOrThrow);
	}

	findQuestionsByTestId(testId: string, db: DrizzleTransaction | DrizzleClient = this.drizzle.db) {
		return db.select().from(questionsTable).where(eq(questionsTable.testId, testId));
	}

	createMultiple(
		questions: CreateQuestionDto[],
		testId: string,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db.insert(questionsTable).values(
			questions.map((q) => ({
				...q,
				testId,
				options: q.options.map((o) => ({ ...o, id: generateId() }))
			}))
		);
	}

	updateQuestion(
		id: string,
		question: UpdateQuestionDto,
		db: DrizzleTransaction | DrizzleClient = this.drizzle.db
	) {
		return db
			.update(questionsTable)
			.set(question)
			.where(eq(questionsTable.id, id))
			.returning()
			.then(takeFirst);
	}

	deleteQuestion(id: string, db: DrizzleTransaction | DrizzleClient = this.drizzle.db) {
		return db.delete(questionsTable).where(eq(questionsTable.id, id));
	}
}
