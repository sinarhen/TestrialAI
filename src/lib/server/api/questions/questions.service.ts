import { container, injectable } from 'tsyringe';
import type { CreateQuestionDto } from '@api/questions/dtos/create-question.dto';
import { QuestionsRepository } from '@api/questions/questions.repository';
import { QuestionsGenerationService } from '@api/questions/openai/questions-generation.service';
import { NotFound } from '@api/common/utils/exceptions';
import type { UpdateQuestionDto } from '@api/questions/dtos/update-question.dto';
import type { ModifyQuestionTool } from '@api/questions/dtos/modify-question-tool.dto';
import { TestsRepository } from '@api/tests/tests.repository';
import type { GenerateQuestionParamsDto } from './dtos/generate-question-params.dto';

@injectable()
export class QuestionsService {
	constructor(
		private questionsRepository = container.resolve(QuestionsRepository),
		private generationService = container.resolve(QuestionsGenerationService),
		private testsRepository = container.resolve(TestsRepository)
	) {}

	deleteQuestion(id: string) {
		return this.questionsRepository.deleteQuestion(id);
	}

	createQuestion(question: CreateQuestionDto, testId: string) {
		return this.questionsRepository.create(question, testId);
	}

	createMultipleQuestions(questions: CreateQuestionDto[], testId: string) {
		return this.questionsRepository.createMultiple(questions, testId);
	}

	updateQuestion(id: string, question: UpdateQuestionDto) {
		return this.questionsRepository.updateQuestion(id, question);
	}

	async generateQuestion(testId: string, { topic }: GenerateQuestionParamsDto) {
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
