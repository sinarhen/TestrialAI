import { container, injectable } from 'tsyringe';
import { TestSessionsRepository } from './test-sessions.repository';
import type { CreateTestSessionDto } from './dtos/create-test-session.dto';
import { TestsRepository } from '../tests/tests.repository';
import type { TestSession } from './tables';
import { DrizzleTransactionService } from '../common/services/drizzle-transaction.service';
import { InternalError, NotFound } from '../common/utils/exceptions';
import { mapTestSessionToPublic, type PublicTestSessionDto } from './dtos/test-session.dto';

@injectable()
export class TestSessionsService {
	constructor(
		private testsSessionsRepository = container.resolve(TestSessionsRepository),
		private testsRepository = container.resolve(TestsRepository),
		private drizzleTransactionService = container.resolve(DrizzleTransactionService)
	) {}

	async startTestSession(testSessionCode: string, name: string, userId?: string) {
		return await this.drizzleTransactionService.runTransaction(async (tx) => {
			const testSession = await this.testsSessionsRepository.getTestSessionByCode(
				testSessionCode,
				tx
			);
			if (!testSession) {
				tx.rollback();
				throw NotFound('Test session not found');
			}

			const participantAdded = await this.testsSessionsRepository.addParticipantToTestSession(
				testSession.id,
				name,
				userId,
				tx
			);

			return participantAdded;
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

	public async getTestSessionPublicData(testSessionId: string): Promise<PublicTestSessionDto> {
		const testSession = await this.testsSessionsRepository.getTestSession(testSessionId);

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

	// public async getTestSession(testSessionId: string) {
	// 	return;
	// }

	// public async answerQuestion(testSessionId: string, questionId: string, answer: string) {
	// 	return;
	// }

	// public async getTestSessionResults(testSessionId: string) {
	// 	return;
	// }

	// public async getTestSessionQuestion(testSessionId: string) {
	// 	return;
	// }
}
