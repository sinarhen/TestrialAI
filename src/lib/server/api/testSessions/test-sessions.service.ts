import { container, injectable } from 'tsyringe';
import { TestSessionsRepository } from './test-sessions.repository';
import type { CreateTestSessionDto } from './dtos/create-test-session.dto';
import { TestsRepository } from '../tests/tests.repository';
import { type TestSession, type TestSessionWithRelations } from './tables';
import { DrizzleTransactionService } from '../common/services/drizzle-transaction.service';
import { BadRequest, InternalError, NotFound } from '../common/utils/exceptions';
import { type PublicTestSessionDto } from './dtos/public-test-session.dto';
import { mapTestSessionToPublic } from './dtos/public-test-session.dto';
import type { AnswerDto } from './dtos/answer.dto';

@injectable()
export class TestSessionsService {
	constructor(
		private testsSessionsRepository = container.resolve(TestSessionsRepository),
		private testsRepository = container.resolve(TestsRepository),
		private drizzleTransactionService = container.resolve(DrizzleTransactionService)
	) {}

	public async syncAnswers(answers: AnswerDto[], participantId: string) {
		return this.testsSessionsRepository.upsertParticipantAnswers(
			answers.map((a) => ({
				...a,
				testParticipantId: participantId
			}))
		);
	}

	public async submitTestSession(
		testSessionCode: string,
		participantId: string,
		answers: AnswerDto[]
	) {
		return await this.drizzleTransactionService.runTransaction(async (tx) => {
			await this.testsSessionsRepository.upsertParticipantAnswers(
				answers.map((a) => ({
					...a,
					testParticipantId: participantId
				})),
				tx
			);
			const testSession = await this.testsSessionsRepository.getTestSessionWithParticipantAnswers(
				testSessionCode,
				participantId,
				tx
			);

			if (!testSession) {
				throw NotFound('Test session not found');
			}

			if (!testSession.participants.at(0)) {
				throw NotFound('Test session not found');
			}

			if (!testSession || !testSession.participants.at(0)) {
				throw NotFound('Test session not found');
			}

			if (testSession.durationInMinutes) {
				const timeLeft = this.calculateTimeLeft(
					testSession.durationInMinutes,
					Number(testSession.participants[0].startedAt)
				);
				if (timeLeft <= 0) {
					throw BadRequest('Test session time is over');
				}
			}

			const calculatedScore = this.calculateScore(testSession, answers);

			return this.testsSessionsRepository.updateTestSessionParticipant(
				participantId,
				{
					score: calculatedScore,
					status: 'COMPLETED',
					submittedAt: new Date()
				},
				tx
			);
		});
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

			if (!participant) {
				throw InternalError('Failed to create participant');
			}

			return {
				testSessionId: testSession.id,
				participant: {
					anonymousUserId: participant.anonymousUserId,
					id: participant.id
				}
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
	public async getTestSessionPublicData(testSessionCode: string): Promise<PublicTestSessionDto> {
		const testSession = await this.testsSessionsRepository.getTestSessionByCode(testSessionCode);

		if (!testSession) {
			throw NotFound('Test session not found');
		}

		return mapTestSessionToPublic(testSession);
	}

	public async getTestSessionPublicDataWithParticipantAnswers(
		testSessionCode: string,
		participantId: string
	) {
		const testSession = await this.testsSessionsRepository.getTestSessionWithParticipantAnswers(
			testSessionCode,
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

	private calculateScore(testSession: TestSessionWithRelations, answers: AnswerDto[]) {
		const answersLookup = new Map(answers.map((a) => [a.questionId, a]));

		let calculatedScore = 0;
		testSession.testStateJson.questions.forEach((question) => {
			if (question.answerType === 'text') {
				if (question.correctAnswer === answersLookup.get(question.id)?.typedAnswer) {
					calculatedScore += 1 / testSession.testStateJson.questions.length;
				}
			} else {
				const correctOptions = question.options?.filter((o) => o.isCorrect);
				if (!correctOptions) {
					throw InternalError('Correct options not found');
				}
				const selectedOptions = answersLookup.get(question.id)?.selectedOptionIds;
				if (!selectedOptions) {
					throw BadRequest('Selected options not found');
				}
				const optionsLookup = new Map(correctOptions.map((o) => [o.id, o]));
				const correctSelectedCount = selectedOptions.filter((o) => optionsLookup.has(o)).length;
				calculatedScore +=
					correctSelectedCount / testSession.testStateJson.questions.length / correctOptions.length;
			}
		});

		return calculatedScore;
	}

	private calculateTimeLeft(durationInMinutes: number, startedAt: number) {
		const timeLeft = durationInMinutes * 60 - (Date.now() - startedAt) / 1000;

		return timeLeft;
	}
}
