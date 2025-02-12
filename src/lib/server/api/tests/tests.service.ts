import { container, injectable } from 'tsyringe';
import { TestsRepository } from '@api/tests/tests.repository';
import { TestsGenerationService } from './openai/tests-generation.service';
import type { GenerateTestParamsDto } from '@/server/api/tests/dtos/generate-test-params.dto';
import { QuestionsRepository } from '@api/questions/questions.repository';
import { PdfService } from '@api/common/services/pdf.service';
import type { CreateTestDto } from './dtos/create-test-dto';
import { DrizzleTransactionService } from '../common/services/drizzle-transaction.service';
import { NotFound } from '../common/utils/exceptions';
import { mapTestSession } from '../testSessions/dtos/test-session.dto';

@injectable()
export class TestsService {
	constructor(
		private questionsRepository = container.resolve(QuestionsRepository),
		private testsRepository = container.resolve(TestsRepository),
		private testsGenerationService = container.resolve(TestsGenerationService),
		private pdfService = container.resolve(PdfService),
		private dbTransactionService = container.resolve(DrizzleTransactionService)
	) {}

	getTestsHistoryForUser(userId: string) {
		const history = this.testsRepository.findAllByUserId(userId);
		if (!history) {
			throw NotFound('Tests history is not found');
		}
		return history;
	}

	async saveTest(test: CreateTestDto, userId: string) {
		return await this.dbTransactionService.runTransaction(async (tx) => {
			const createdTest = await this.testsRepository.createTest(test, userId, tx);
			await this.questionsRepository.createMultiple(test.questions, createdTest.id, tx);
			return createdTest.id;
		});
	}

	async findTest(testId: string) {
		const test = await this.testsRepository.findOneByIdWithRelations(testId);
		if (!test) {
			throw NotFound('Test is not found');
		}
		return { ...test, sessions: test.sessions.map(mapTestSession) };
	}

	async generateTestStream(params: GenerateTestParamsDto) {
		const testStream = await this.testsGenerationService.streamTestGeneration(params);
		if (!testStream) {
			throw NotFound('Test generation failed');
		}
		return testStream;
	}

	async deleteTest(testId: string) {
		return this.testsRepository.delete(testId);
	}

	async generatePdf(testId: string) {
		return this.pdfService.generateTestPdf(testId);
	}
}
