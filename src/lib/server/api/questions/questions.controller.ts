import { container, injectable } from 'tsyringe';
import { Controller } from '../common/factories/controllers.factory';
import { authState } from '../common/middleware/auth.middleware';
import { zValidator } from '@hono/zod-validator';
import { QuestionsService } from '@api/questions/questions.service';
import { createQuestionDto } from '@api/questions/dtos/create-question.dto';
import { generateQuestionParamsDto } from '@/server/api/questions/dtos/generate-question-params.dto';
import { updateQuestionDto } from '@api/questions/dtos/update-question.dto';
import { modifyQuestionToolDto } from '@api/questions/dtos/modify-question-tool.dto';
import { streamOpenAiResponse } from '@api/common/utils/hono';
import { z } from 'zod';

@injectable()
export class QuestionsController extends Controller {
	constructor(private questionsService = container.resolve(QuestionsService)) {
		super();
	}

	routes() {
		return (
			this.controller
				// .use(authState('session'))
				.post(
					'/:testId/questions',
					authState('session'),
					zValidator('json', createQuestionDto),
					async (c) => {
						const question = c.req.valid('json');
						const testId = c.req.param('testId');
						const createdQuestion = await this.questionsService.createQuestion(question, testId);
						return c.json(createdQuestion);
					}
				)
				.post(
					'/:testId/questions/generate',
					authState('session'),

					zValidator('json', generateQuestionParamsDto),
					async (c) => {
						const testId = c.req.param('testId');
						const dto = c.req.valid('json');

						const openAiStream = await this.questionsService.generateQuestion(testId, dto);
						return streamOpenAiResponse(c, openAiStream);
					}
				)
				.put(
					'/:testId/questions/:questionId',
					authState('session'),

					zValidator('json', updateQuestionDto),
					async (c) => {
						const questionId = c.req.param('questionId');
						const questionDto = c.req.valid('json');
						const updatedQuestion = await this.questionsService.updateQuestion(
							questionId,
							questionDto
						);
						return c.json(updatedQuestion);
					}
				)
				.delete('/:testId/questions/:questionId', authState('session'), async (c) => {
					const questionId = c.req.param('questionId');
					await this.questionsService.deleteQuestion(questionId);
					return c.json({ message: 'Question deleted' });
				})
				.post(
					'/:testId/questions/:questionId/:tool',
					authState('session'),
					// validator('param', (_, c) => {
					// 	const tool = c.req.param('tool');
					// 	const parsed = modifyQuestionToolDto.safeParse({
					// 		tool
					// 	});
					// 	if (!parsed.success) {
					// 		return c.json({ message: 'Invalid tool' }, 400);
					// 	}
					// 	return parsed.data;
					// }),
					zValidator(
						'param',
						z.object({
							testId: z.string(),
							questionId: z.string(),
							tool: modifyQuestionToolDto.shape.tool
						})
					),
					async (c) => {
						const { questionId, testId } = c.req.param();

						const tool = c.req.valid('param').tool;

						const openAiStream = await this.questionsService.regenerateQuestion(
							testId,
							questionId,
							tool
						);
						return streamOpenAiResponse(c, openAiStream);
					}
				)
				.post(
					'/:testId/questions/:questionId/generate-code-block',
					authState('session'),
					async (c) => {
						const questionId = c.req.param('questionId');
						const openAiStream = await this.questionsService.generateCodeBlock(questionId);

						return streamOpenAiResponse(c, openAiStream);
					}
				)
			// .post('/:testId/questions/:questionId/generate-answer-explanation', async (c) => {
			// 	const openAiStream = await this.questionsService.generateAnswerExplanation(
			// 		c.req.body,
			// 		c.req.params.testId,
			// 		c.req.params.questionId
			// 	);
			// 	return streamOpenAiResponse(c, openAiStream);
			// })
		);
	}
}
