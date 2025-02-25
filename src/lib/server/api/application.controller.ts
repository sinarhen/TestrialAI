import { container, injectable } from 'tsyringe';
import { contextStorage } from 'hono/context-storage';
import { rateLimit } from './common/middleware/rate-limit.middleware';
import { RootController } from './common/factories/controllers.factory';
import { requestId } from 'hono/request-id';
import { generateId } from './common/utils/crypto';
import { UsersController } from './users/users.controller';
import { browserSessions } from './common/middleware/browser-session.middleware';
import { AuthController } from './auth/auth.controller';
import { sessionManagement } from './common/middleware/session-management.middleware';
import { TestsController } from '@/server/api/tests/tests.controller';
import { QuestionsController } from './questions/questions.controller';
import { TestSessionsController } from './testSessions/test-sessions.controller';
import { CustomErrorHandler } from './common/middleware/exceptions-handler.middleware';
import { logger } from 'hono/logger';

@injectable()
export class ApplicationController extends RootController {
	constructor(
		private iamController = container.resolve(AuthController),
		private usersController = container.resolve(UsersController),
		private testsController = container.resolve(TestsController),
		private questionsController = container.resolve(QuestionsController),
		private testSessionsController = container.resolve(TestSessionsController),
		private customErrorHandler = container.resolve(CustomErrorHandler)
	) {
		super();
	}

	routes() {
		return this.controller
			.get('/', (c) => {
				return c.json({ status: 'ok' });
			})
			.get('/healthz', (c) => {
				return c.json({ status: 'ok' });
			})
			.get('/rate-limit', rateLimit({ limit: 3, minutes: 1 }), (c) => {
				return c.json({ message: 'Test!' });
			});
	}

	registerControllers() {
		return this.controller
			.basePath('/api')
			.use(requestId({ generator: () => generateId() }))
			.use(contextStorage())
			.use(browserSessions)
			.use(sessionManagement)
			.use(logger())
			.route('/', this.routes())
			.route('/iam', this.iamController.routes())
			.route('/users', this.usersController.routes())
			.route('/tests', this.testsController.routes())
			.route('/questions', this.questionsController.routes())
			.route('/test-sessions', this.testSessionsController.routes())
			.onError(this.customErrorHandler.handle);
	}
}
