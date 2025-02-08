import { container, injectable } from 'tsyringe';
import { Controller } from '../common/factories/controllers.factory';
import { authState } from '../common/middleware/auth.middleware';
import { TestsService } from '@api/tests/tests.service';
import { generateTestParamsDto } from '@/server/api/tests/dtos/generate-test-params.dto';
import { streamOpenAiResponse } from '@api/common/utils/hono';
import { rateLimit } from '../common/middleware/rate-limit.middleware';
import { createTestDto } from './dtos/create-test-dto';
import { NotFound } from '../common/utils/exceptions';
import { zValidator } from '../common/utils/zod-validator-wrapper';

@injectable()
export class TestsController extends Controller {
	constructor(private testsService = container.resolve(TestsService)) {
		super();
	}

	routes() {
		return this.controller
			.post('/', authState('session'), zValidator('json', createTestDto), async (c) => {
				const { session } = c.var;
				const parsed = c.req.valid('json');

				const testId = await this.testsService.saveTest(parsed, session.userId);
				return c.json({ testId });
			})
			.get('/history', authState('session'), async (c) => {
				const userId = c.var.session.userId;
				const tests = await this.testsService.getTestsHistoryForUser(userId);
				return c.json(tests);
			})
			.post(
				'/generate',
				rateLimit({
					limit: 5,
					minutes: 1
				}),
				authState('session'),
				zValidator('json', generateTestParamsDto),
				async (c) => {
					const body = c.req.valid('json');
					const openAiStream = await this.testsService.generateTestStream(body);
					return streamOpenAiResponse(c, openAiStream);
				}
			)
			.delete('/:testId', authState('session'), (c) => {
				const testId = c.req.param('testId');
				this.testsService.deleteTest(testId);
				return c.json({ message: 'Test!' });
			})
			.get('/:testId', async (c) => {
				const testId = c.req.param('testId');
				const test = await this.testsService.findTest(testId);
				if (!test) {
					throw NotFound('Test is not found');
				}
				return c.json(test);
			})
			.get('/:testId/pdf', authState('session'), async (c) => {
				const testId = c.req.param('testId');
				const pdf = await this.testsService.generatePdf(testId);
				return c.body(Buffer.from(pdf).buffer, {
					headers: {
						'Content-Type': 'application/pdf',
						// TODO: add filename
						'Content-Disposition': `attachment; filename=test-${testId}.pdf`
					}
				});
			});
		// .post('/:testId/questions', (c) => {
		// 	await
		// 	return c.json({ message: 'Test!' });
		// })
		// .post('/:testId/questions/generate', (c) => {
		// 	return c.json({ message: 'Test!' });
		// })
		// .post('/:testId/questions/:questionId', (c) => {
		// 	return c.json({ message: 'Test!' });
		// })
		// .post('/:testId/questions/:questionId/:tool', (c) => {
		// 	return c.json({ message: 'Test!' });
		// })
		// .post('/:testId/questions/:questionId/code-block', (c) => {
		// 	return c.json({ message: 'Test!' });
		// });
	}
}
