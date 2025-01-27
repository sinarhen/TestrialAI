import { inject, injectable } from '@needle-di/core';
import { Controller } from '../common/factories/controllers.factory';
import { authState } from '../common/middleware/auth.middleware';
import { zValidator } from '@hono/zod-validator';
import { QuestionsService } from '@api/questions/questions.service';
import { createQuestionDto } from '@api/questions/dtos/create-question.dto';
import { generateQuestionDto } from '@api/questions/dtos/generate-question.dto';

@injectable()
export class QuestionsController extends Controller {
	constructor(private questionsService = inject(QuestionsService)) {
		super();
	}

	routes() {
		return this.controller
			.use(authState('session'))
			.post('/:testId/questions', zValidator('json', createQuestionDto), async (c) => {
				const question = c.req.valid('json');
				const testId = c.req.param('testId');
				await this.questionsService.createQuestion(question, testId);
				return c.json({ message: 'Test!' });
			})
			.post('/:testId/questions/generate', zValidator('json', generateQuestionDto), async (c) => {
				const testId = c.req.param('testId');
				const dto = c.req.valid('json');

				const question = await this.questionsService.generateQuestion(testId, dto);
				return c.json(question);
			})
			.post('/:testId/questions/:questionId', async (c) => {
				// await this.questionsService.updateQuestion(
				// 	c.req.body,
				// 	c.req.params.testId,
				// 	c.req.params.questionId
				// );
				return c.json({ message: 'Test!' });
			})
			.post('/:testId/questions/:questionId/:tool', async (c) => {
				// await this.questionsService.regenerateQuestion(
				// 	c.req.params.testId,
				// 	c.req.params.questionId
				// );
				return c.json({ message: 'Test!' });
			})
			.post('/:testId/questions/:questionId/generate-code-block', async (c) => {
				// await this.questionsService.generateCodeBlock(c.req.body, c.req.params.testId, c.req.params.questionId);

				return c.json({ message: 'Test!' });
			})
			.post('/:testId/questions/:questionId/generate-answer-explanation', async (c) => {
				// await this.questionsService.generateAnswerExplanation(c.req.body, c.req.params.testId, c.req.params.questionId);
				return c.json({ message: 'Test!' });
			});
	}
}
