import { Controller } from '@api/common/factories/controllers.factory';
import { container, injectable } from 'tsyringe';
import { authState } from '@api/common/middleware/auth.middleware';
import { TestSessionsService } from '@api/testSessions/test-sessions.service';
import { createTestSessionDto } from './dtos/create-test-session.dto';
import { zValidator } from '../common/utils/zod-validator-wrapper';
import { z } from 'zod';
import { answerDto } from './dtos/answer.dto';
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
					const answersDtos = c.req.valid('json');
					const testSession = await this.testSessionsService.syncAnswers(
						answersDtos,
						c.var['participant-session'].id
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
				zValidator(
					'json',
					z.object({
						name: z.string()
					})
				),
				async (c) => {
					const testSessionCode = c.req.param('testSessionCode');
					const validJson = c.req.valid('json');
					const testSession = await this.testSessionsService.startTestSession(
						testSessionCode,
						validJson.name,
						c.var.session?.userId
					);

					if (testSession.participant.anonymousUserId) {
						await this.participantSessionsService.setParticipantSessionCookie({
							expiresAt: dayjs().add(1, 'day').toDate(),
							id: testSession.participant.id,
							anonymousUserId: testSession.participant.anonymousUserId
						});
					}
					return c.json(testSession);
				}
			);
}
