import { container, injectable } from 'tsyringe';
import { TestSessionsRepository } from './test-sessions.repository';
import type { CreateTestSessionDto } from './dtos/create-test-session.dto';
import { TestsRepository } from '../tests/tests.repository';

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

		return this.testsSessionsRepository.createTestSession({
			...createTestSessionDto,
			testStateJson: originalTest
		});
	}

	public async getTestSession(testSessionId: string) {
		const testSession = this.testsSessionsRepository.getTestSession(testSessionId);

		if (!testSession) {
			throw new Error('Test session not found');
		}

		return testSession;
	}
	public async getTestSessionByCode(code: string) {
		const testSession = this.testsSessionsRepository.getTestSessionByCode(code);
		if (!testSession) {
			throw new Error('Test session not found');
		}
		return testSession;
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
