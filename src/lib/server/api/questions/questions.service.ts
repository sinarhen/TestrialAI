import { inject, injectable } from '@needle-di/core';
import type { CreateQuestionDto } from '@api/questions/dtos/create-question.dto';
import { QuestionsRepository } from '@api/questions/questions.repository';
import { QuestionsGenerationService } from '@api/questions/openai/questions-generation.service';
import { NotFound } from '@api/common/utils/exceptions';
import type { GenerateQuestionDto } from '@api/questions/dtos/generate-question.dto';
import type { UpdateQuestionDto } from '@api/questions/dtos/update-question.dto';
import type { ModifyQuestionTool } from '@api/questions/dtos/modify-question-tool.dto';
import { TestsRepository } from '@api/tests/tests.repository';

@injectable()
export class QuestionsService {
	constructor(
		private questionsRepository = inject(QuestionsRepository),
		private generationService = inject(QuestionsGenerationService),
		private testsRepository = inject(TestsRepository)
	) {}

	createQuestion(question: CreateQuestionDto, testId: string) {
		return this.questionsRepository.create(question, testId);
	}

	createMultipleQuestions(questions: CreateQuestionDto[], testId: string) {
		return this.questionsRepository.createMultiple(questions, testId);
	}

	updateQuestion(id: string, question: UpdateQuestionDto) {
		return this.questionsRepository.updateQuestion(id, question);
	}

	async generateQuestion(testId: string, { topic }: GenerateQuestionDto) {
		const test = await this.testsRepository.findOneByIdIncludeQuestions(testId);
		if (!test) {
			throw NotFound('Test not found');
		}
		const existingQuestions = test.questions.map((q) => q.question);
		const testTitle = test.title;
		return this.generationService.streamGenerateQuestion({
			topic,
			existingQuestions,
			testTitle
		});
	}

	async regenerateQuestion(testId: string, questionId: string, tool: ModifyQuestionTool) {
		const test = await this.testsRepository.findOneByIdIncludeQuestions(testId);
		if (!test) {
			throw NotFound('Test not found');
		}
		const question = test.questions.find((q) => q.id === questionId);
		if (!question) {
			throw NotFound('Question not found');
		}
		return this.generationService.streamRegenerateQuestion({
			tool,
			questionTopic: question.question,
			existingQuestions: test.questions.map((q) => q.question),
			testTitle: test.title
		});
	}

	async generateCodeBlock(questionId: string) {
		const question = await this.questionsRepository.findOneByIdIncludeTest(questionId);
		if (!question) {
			throw NotFound('Question not found');
		}
		return this.generationService.streamGenerateCodeBlock({
			question: question.question,
			testTitle: question.test.title
		});
	}
}
