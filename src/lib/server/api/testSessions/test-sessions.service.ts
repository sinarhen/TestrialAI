import { container, injectable } from 'tsyringe';
import { TestSessionsRepository } from './test-sessions.repository';
import type { CreateTestSessionDto } from './dtos/create-test-session.dto';
import { TestsRepository } from '../tests/tests.repository';
import { type TestSession, type TestSessionWithRelations } from './tables';
import { DrizzleTransactionService } from '../common/services/drizzle-transaction.service';
import { BadRequest, InternalError, NotFound, Unauthorized } from '../common/utils/exceptions';
import { type PublicTestSessionDto } from './dtos/public-test-session.dto';
import { mapTestSessionToPublic } from './dtos/public-test-session.dto';
import { TokenService } from '../common/services/token.service';
import type { AnswerDto } from './dtos/answer.dto';

@injectable()
export class TestSessionsService {
	constructor(
		private testsSessionsRepository = container.resolve(TestSessionsRepository),
		private testsRepository = container.resolve(TestsRepository),
		private drizzleTransactionService = container.resolve(DrizzleTransactionService),
		private tokenService: TokenService = container.resolve(TokenService)
	) {}

	public async syncAnswers(testSessionToken: string, answers: AnswerDto[]) {
		const { participantId } = this.tokenService.decodeTestSessionToken(testSessionToken);
		return this.testsSessionsRepository.upsertParticipantAnswers(
			answers.map((a) => ({
				...a,
				testParticipantId: participantId
			}))
		);
	}

	public async submitTestSession(testSessionToken: string, answers: AnswerDto[]) {
		return await this.drizzleTransactionService.runTransaction(async (tx) => {
			const { participantId } = this.tokenService.decodeTestSessionToken(testSessionToken);

			await this.testsSessionsRepository.upsertParticipantAnswers(
				answers.map((a) => ({
					...a,
					testParticipantId: participantId
				})),
				tx
			);
			const testSession = await this.testsSessionsRepository.getTestSessionWithParticipantAnswers(
				testSessionToken,
				participantId,
				tx
			);

			if (!testSession || !testSession.participants.at(0)) {
				throw NotFound('Test session not found');
			}

			if (testSession.durationInMinutes) {
				const timeLeft =
					testSession.durationInMinutes * 60 -
					(Date.now() - Number(testSession.participants[0].startedAt)) / 1000;

				if (
					timeLeft <= 0
					//	TODO: && !testSession.isOverTimeAllowed
				) {
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
}
