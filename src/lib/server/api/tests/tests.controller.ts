import { inject, injectable } from '@needle-di/core';
import { Controller } from '../common/factories/controllers.factory';
import { authState } from '../common/middleware/auth.middleware';
import { testDto } from './dtos/test.dto';
import { zValidator } from '@hono/zod-validator';
import { TestsService } from '@api/tests/tests.service';
import { generateTestDto } from '@api/tests/dtos/generate-test.dto';

@injectable()
export class TestsController extends Controller {
	constructor(private testsService = inject(TestsService)) {
		super();
	}

	routes() {
		return this.controller
			.use(authState('session'))
			.post('/', zValidator('json', testDto), async (c) => {
				const { session } = c.var;
				const parsed = c.req.valid('json');
				const testId = await this.testsService.saveTest(parsed, session.user.id);
				return c.json({ testId });
			})
			.post('/generate', zValidator('json', generateTestDto), async (c) => {
				const body = c.req.valid('json');
				const stream = await this.testsService.generateTestStream(body);
			})
			.delete('/:testId', (c) => {
				await this.testsService.deleteTest(c.req.params.testId);
				return c.json({ message: 'Test!' });
			})
			.get('/:testId/pdf', (c) => {
				await this.testsService.generatePdf(c.req.params.testId);
				return c.json({ message: 'Test!' });
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
