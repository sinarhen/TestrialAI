import { container, injectable } from 'tsyringe';
import { TestSessionsRepository } from './test-sessions.repository';
import type { CreateTestSessionDto } from './dtos/create-test-session.dto';
import { TestsRepository } from '../tests/tests.repository';
import type { TestSession } from './tables';

@injectable()
export class TestSessionsService {
	constructor(
		private testsSessionsRepository = container.resolve(TestSessionsRepository),
		private testsRepository = container.resolve(TestsRepository)
	) {}

	public async createTestSession(createTestSessionDto: CreateTestSessionDto) {
		const originalTest = await this.testsRepository.findOneByIdIncludeQuestions(
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
			throw new Error('Failed to create test session');
		}
		return this.convertDatesToNumbers(created);
	}

	public async getTestSession(testSessionId: string) {
		const testSession = await this.testsSessionsRepository.getTestSession(testSessionId);

		if (!testSession) {
			throw new Error('Test session not found');
		}

		return this.convertDatesToNumbers(testSession);
	}
	public async getTestSessionByCode(code: string) {
		const testSession = await this.testsSessionsRepository.getTestSessionByCode(code);
		if (!testSession) {
			throw new Error('Test session not found');
		}
		return this.convertDatesToNumbers(testSession);
	}

	// TODO: Find a better way to convert dates to numbers for all entities
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
