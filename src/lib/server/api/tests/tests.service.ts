import { container, injectable } from 'tsyringe';
import { TestsRepository } from '@api/tests/tests.repository';
import { TestsGenerationService } from './openai/tests-generation.service';
import type { GenerateTestParamsDto } from '@/server/api/tests/dtos/generate-test-params.dto';
// import { DrizzleTransactionService } from '@api/common/services/drizzle-transaction.service';
import { QuestionsRepository } from '@api/questions/questions.repository';
import { PdfService } from '@api/common/services/pdf.service';
import type { CreateTestDto } from './dtos/create-test-dto';
import { DrizzleService } from '../db/libsql/drizzle.server';

@injectable()
export class TestsService {
	constructor(
		private questionsRepository = container.resolve(QuestionsRepository),
		private testsRepository = container.resolve(TestsRepository),
		private testsGenerationService = container.resolve(TestsGenerationService),
		private pdfService = container.resolve(PdfService),
		private drizzleService = container.resolve(DrizzleService)
	) {}

	getTestsHistoryForUser(userId: string) {
		return this.testsRepository.findAllByUserId(userId);
	}

	async saveTest(test: CreateTestDto, userId: string) {
		await this.drizzleService.db.transaction(async (tx) => {
			const createdTest = await this.testsRepository.createTest(test, userId, tx);
			await this.questionsRepository.createMultiple(test.questions, createdTest.id, tx);
			return createdTest.id;
		});
	}

	async findTest(testId: string) {
		return this.testsRepository.findOneByIdIncludeQuestions(testId);
	}

	generateTestStream(params: GenerateTestParamsDto) {
		return this.testsGenerationService.streamTestGeneration(params);
	}

	async deleteTest(testId: string) {
		return this.testsRepository.delete(testId);
	}

	async generatePdf(testId: string) {
		return this.pdfService.generateTestPdf(testId);
	}
}
