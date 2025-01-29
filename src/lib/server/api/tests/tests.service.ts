import { inject, injectable } from '@needle-di/core';
import { TestsRepository } from '@api/tests/tests.repository';
import type { CreateTestDto } from '@api/tests/dtos/test.dto';
import { TestsGenerationService } from './openai/tests-generation.service';
import type { GenerateTestDto } from '@api/tests/dtos/generate-test.dto';
import { DrizzleTransactionService } from '@api/common/services/drizzle-transaction.service';
import { QuestionsRepository } from '@api/questions/questions.repository';
import { PdfService } from '@api/common/services/pdf.service';

@injectable()
export class TestsService {
	constructor(
		private questionsRepository = inject(QuestionsRepository),
		private testsRepository = inject(TestsRepository),
		private testsGenerationService = inject(TestsGenerationService),
		private drizzleTransactionService = inject(DrizzleTransactionService),
		private pdfService = inject(PdfService)
	) {}

	async saveTest(test: CreateTestDto, userId: string) {
		return await this.drizzleTransactionService.runTransaction(async (tx) => {
			const createdTest = await this.testsRepository.createTest(test, userId, tx);
			await this.questionsRepository.createMultiple(test.questions, createdTest.id, tx);
			return createdTest.id;
		});
	}

	async findTest(testId: string) {
		return this.testsRepository.findOneByIdIncludeQuestions(testId);
	}

	generateTestStream(params: GenerateTestDto) {
		return this.testsGenerationService.streamTestGeneration(params);
	}

	async deleteTest(testId: string) {
		return this.testsRepository.delete(testId);
	}

	async generatePdf(testId: string) {
		return this.pdfService.generateTestPdf(testId);
	}
}
