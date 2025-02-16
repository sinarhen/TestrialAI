import { container, injectable } from 'tsyringe';
import { TestSessionsRepository } from './test-sessions.repository';
import type { CreateTestSessionDto } from './dtos/create-test-session.dto';
import { TestsRepository } from '../tests/tests.repository';
import { type TestSession } from './tables';
import { DrizzleTransactionService } from '../common/services/drizzle-transaction.service';
import { InternalError, NotFound, Unauthorized } from '../common/utils/exceptions';
import { type PublicTestSessionDto } from './dtos/public-test-session.dto';
import { mapTestSessionToPublic } from './dtos/public-test-session.dto';
import { TokenService } from '../common/services/token.service';

@injectable()
export class TestSessionsService {
	constructor(
		private testsSessionsRepository = container.resolve(TestSessionsRepository),
		private testsRepository = container.resolve(TestsRepository),
		private drizzleTransactionService = container.resolve(DrizzleTransactionService),
		private tokenService: TokenService = container.resolve(TokenService)
	) {}

	public async syncAnswers(
		testSessionToken: string,
		answers: {
			questionId: string;
			typedAnswer?: string;
			selectedOptionIds?: string[];
		}[]
	) {
		const { participantId } = this.tokenService.decodeTestSessionToken(testSessionToken);
		return this.testsSessionsRepository.upsertParticipantAnswers(
			answers.map((a) => ({
				...a,
				testParticipantId: participantId
			}))
		);
	}

	async startTestSession(testSessionCode: string, name: string, userId?: string) {
		return await this.drizzleTransactionService.runTransaction(async (tx) => {
			const testSession = await this.testsSessionsRepository.getTestSessionByCode(
				testSessionCode,
				tx
			);
			if (!testSession) {
				throw NotFound('Test session not found');
			}

			const participant = await this.testsSessionsRepository.addParticipantToTestSession(
				testSession.id,
				name,
				userId,
				tx
			);

			const sessionToken = this.tokenService.encodeTestSessionToken({
				testSessionId: testSession.id,
				participantId: participant?.id ?? ''
			});

			return {
				sessionToken,
				testSessionId: testSession.id
			};
		});
	}

	async createTestSession(createTestSessionDto: CreateTestSessionDto) {
		const originalTest = await this.testsRepository.findOneByIdWithRelations(
			createTestSessionDto.testId
		);
		if (!originalTest) {
			throw new Error('Test not found');
		}

		const created = await this.testsSessionsRepository.createTestSession({
			...createTestSessionDto,
			testStateJson: originalTest
		});
		if (!created) {
			throw InternalError('Failed to create test session');
		}
		return this.convertDatesToNumbers(created);
	}

	public async getTestSession(testSessionId: string) {
		const testSession = await this.testsSessionsRepository.getTestSession(testSessionId);

		if (!testSession) {
			throw NotFound('Test session not found');
		}

		return this.convertDatesToNumbers(testSession);
	}
	public async getTestSessionPublicData(token: string): Promise<PublicTestSessionDto> {
		let decodedToken;
		try {
			decodedToken = this.tokenService.decodeTestSessionToken(token);
		} catch (err) {
			console.error(err);
			throw Unauthorized('Invalid session token');
		}

		const { testSessionId, participantId } = decodedToken;

		const testSession = await this.testsSessionsRepository.getTestSessionWithParticipantAnswers(
			testSessionId,
			participantId
		);

		if (!testSession) {
			throw NotFound('Test session not found');
		}

		return mapTestSessionToPublic(testSession);
	}

	public async getTestSessionByCode(code: string) {
		const testSession = await this.testsSessionsRepository.getTestSessionByCode(code);
		if (!testSession) {
			throw new Error('Test session not found');
		}
		return this.convertDatesToNumbers(testSession);
	}

	private convertDatesToNumbers(testSession: TestSession) {
		return {
			...testSession,
			startTime: Number(testSession.startTime),
			endTime: Number(testSession.endTime)
		};
	}
}
