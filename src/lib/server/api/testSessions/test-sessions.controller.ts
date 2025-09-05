import { Controller } from '@api/common/factories/controllers.factory';
import { container, injectable } from 'tsyringe';
import { authState } from '@api/common/middleware/auth.middleware';
import { TestSessionsService } from '@api/testSessions/test-sessions.service';
import { createTestSessionDto } from './dtos/create-test-session.dto';
import { zValidator } from '../common/utils/zod-validator-wrapper';
import { z } from 'zod';
import { answerDto } from '../participants/dtos/answer.dto';
import { ParticipantSessionsService } from '../auth/sessions/participant/participant-sessions.service';
import dayjs from 'dayjs';

// TODO
@injectable()
export class TestSessionsController extends Controller {
	constructor(
		private testSessionsService = container.resolve(TestSessionsService),
		private participantSessionsService = container.resolve(ParticipantSessionsService)
	) {
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
				const testSession =
					await this.testSessionsService.getTestSessionPublicData(testSessionCode);
				return c.json(testSession);
			})
			.get('/:testSessionCode/test', authState('participant-session'), async (c) => {
				const testSessionCode = c.req.param('testSessionCode');
				const testSession =
					await this.testSessionsService.getTestSessionPublicData(testSessionCode);
				return c.json(testSession);
			})
			.post(
				'/:testSessionCode/sync',
				authState('participant-session'),
				zValidator('json', z.array(answerDto)),
				async (c) => {
					const participantSession = c.var['participant-session'];
					if (!participantSession?.id) {
						return c.json({ error: 'Invalid participant session' }, 400);
					}

					const answersDtos = c.req.valid('json');
					const testSession = await this.testSessionsService.syncAnswers(
						answersDtos,
						participantSession.id
					);
					return c.json(testSession);
				}
			)
			.post(
				'/:testSessionCode/submit',
				authState('participant-session'),
				zValidator('json', z.array(answerDto)),
				async (c) => {
					const testSessionCode = c.req.param('testSessionCode');
					const answersDtos = c.req.valid('json');
					const testSession = await this.testSessionsService.submitTestSession(
						testSessionCode,
						c.var['participant-session']?.id,
						answersDtos
					);
					return c.json(testSession);
				}
			)
			.post(
				'/:testSessionCode/start',
				// authState('participant-session'),
				zValidator(
					'json',
					z.object({
						name: z.string()
					})
				),
				async (c) => {
					const testSessionCode = c.req.param('testSessionCode');
					const validJson = c.req.valid('json');
					const result = await this.testSessionsService.startTestSession({
						testSessionCode,
						name: validJson.name,
						participantId: c.var['participant-session']?.id,
						userId: c.var['session']?.userId
					});

					if (!result) {
						return c.json({ error: 'Failed to start test session' }, 500);
					}

					await this.participantSessionsService.setParticipantSessionCookie({
						expiresAt: dayjs().add(1, 'day').toDate(),
						id: result.participantId,
						participantId: result.participantId
					});
					return c.json(result);
				}
			);
}
