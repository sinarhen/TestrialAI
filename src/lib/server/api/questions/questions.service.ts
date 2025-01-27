import { inject, injectable } from '@needle-di/core';
import type { CreateQuestionDto } from '@api/questions/dtos/create-question.dto';
import { QuestionsRepository } from '@api/questions/questions.repository';
import { QuestionsGenerationService } from '@api/questions/openai/questions-generation.service';
import { TestsService } from '@api/tests/tests.service';
import { NotFound } from '@api/common/utils/exceptions';

@injectable()
export class QuestionsService {
	constructor(
		private questionsRepository = inject(QuestionsRepository),
		private generationService = inject(QuestionsGenerationService),
		private testsService = inject(TestsService)
	) {}

	createQuestion(question: CreateQuestionDto, testId: string) {
		return this.questionsRepository.create(question, testId);
	}

	createMultipleQuestions(questions: CreateQuestionDto[], testId: string) {
		return this.questionsRepository.createMultiple(questions, testId);
	}

	async generateQuestion(testId: string) {
		const test = await this.testsService.findTest(testId);
		if (!test) {
			throw NotFound('Test not found');
		}
		const existingQuestions = test.questions.map((q) => q.question);
		const testTitle = test.title;
		return this.generationService.generateQuestion({
			topic: 'test',
			existingQuestions,
			testTitle
		});
	}
}
