import { injectable } from '@needle-di/core';

@injectable()
export class TestSessionsService {
	constructor() {}

	public async createTestSession(sessionId: string) {
		return;
	}

	public async getTestSession(testSessionId: string) {
		return;
	}

	public async answerQuestion(testSessionId: string, questionId: string, answer: string) {
		return;
	}

	public async getTestSessionResults(testSessionId: string) {
		return;
	}

	public async getTestSessionQuestion(testSessionId: string) {
		return;
	}
}
