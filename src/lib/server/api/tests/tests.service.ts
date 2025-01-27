import { inject, injectable } from '@needle-di/core';
import { TestsRepository } from '@api/tests/tests.repository';
import type { CreateTestDto } from '@api/tests/dtos/test.dto';
import { QuestionsService } from '@api/questions/questions.service';
import { TestsGenerationService } from './openai/tests-generation.service';
import type { GenerateTestDto } from '@api/tests/dtos/generate-test.dto';

@injectable()
export class TestsService {
	questionsService: QuestionsService;
	constructor(
		private testsRepository = inject(TestsRepository),
		private testsGenerationService = inject(TestsGenerationService)
	) {
		this.questionsService = inject(QuestionsService);
	}

	async saveTest(test: CreateTestDto, userId: string) {
		const createdTest = await this.testsRepository.createTest(test, userId);
		await this.questionsService.createMultipleQuestions(test.questions, createdTest.id);
		return createdTest.id;
	}

	async findTest(testId: string) {
		return this.testsRepository.findOneByIdIncludeQuestions(testId);
	}

	async generateTestStream(params: GenerateTestDto) {
		return this.testsGenerationService.streamTestGeneration(params);
	}
}
