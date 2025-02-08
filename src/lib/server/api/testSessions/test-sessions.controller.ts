import { Controller } from '@api/common/factories/controllers.factory';
import { container, injectable } from 'tsyringe';
import { authState } from '@api/common/middleware/auth.middleware';
import { TestSessionsService } from '@api/testSessions/test-sessions.service';
import { createTestSessionDto } from './dtos/create-test-session.dto';
import { zValidator } from '../common/utils/zod-validator-wrapper';

// TODO
@injectable()
export class TestSessionsController extends Controller {
	constructor(private testSessionsService = container.resolve(TestSessionsService)) {
		super();
	}

	routes = () =>
		this.controller
			.post('/', authState('session'), zValidator('json', createTestSessionDto), async (c) => {
				const validJson = c.req.valid('json');

				const testSession = await this.testSessionsService.createTestSession(validJson);
				return c.json(testSession);
			})
			.get('/:testSessionCode', async (c) => {
				const testSessionCode = c.req.param('testSessionCode');
				const testSession = await this.testSessionsService.getTestSessionByCode(testSessionCode);
				return c.json(testSession);
			});
}
