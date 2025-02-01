import { Controller } from '@api/common/factories/controllers.factory';
import { container, injectable } from 'tsyringe';
import { authState } from '@api/common/middleware/auth.middleware';
import { TestSessionsService } from '@api/testSessions/test-sessions.service';

// TODO
@injectable()
export class TestSessionsController extends Controller {
	constructor(private testSessionsService = container.resolve(TestSessionsService)) {
		super();
	}

	routes = () =>
		this.controller.post('/test-sessions', authState('session'), async (c) => {
			throw new Error('Not implemented');
		});
}
