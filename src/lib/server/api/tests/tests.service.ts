import { inject, injectable } from '@needle-di/core';
import { TestsRepository } from '@api/tests/tests.repository';
import { TestsGenerationService } from './openai/tests-generation.service';
import type { GenerateTestParamsDto } from '@/server/api/tests/dtos/generate-test-params.dto';
import { DrizzleTransactionService } from '@api/common/services/drizzle-transaction.service';
import { QuestionsRepository } from '@api/questions/questions.repository';
import { PdfService } from '@api/common/services/pdf.service';
import type { CreateTestDto } from './dtos/create-test-dto';

@injectable()
export class TestsService {
	constructor(
		private questionsRepository = inject(QuestionsRepository),
		private testsRepository = inject(TestsRepository),
		private testsGenerationService = inject(TestsGenerationService),
		private drizzleTransactionService = inject(DrizzleTransactionService),
		private pdfService = inject(PdfService)
	) {}

	getTestsHistoryForUsers(userId: string) {
		return this.testsRepository.findAllByUserId(userId);
	}

	async saveTest(test: CreateTestDto, userId: string) {
		console.log(this.testsRepository.drizzle);
		return await this.drizzleTransactionService.drizzle.db.transaction(async (tx) => {
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
