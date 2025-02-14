import { container, injectable } from 'tsyringe';
import { TestSessionsRepository } from './test-sessions.repository';
import type { CreateTestSessionDto } from './dtos/create-test-session.dto';
import { TestsRepository } from '../tests/tests.repository';
import {
	participantAnswerOptionsTable,
	participantAnswersTable,
	testSessionParticipantsTable,
	type TestSession
} from './tables';
import { DrizzleTransactionService } from '../common/services/drizzle-transaction.service';
import { InternalError, NotFound, Unauthorized } from '../common/utils/exceptions';
import { mapTestSessionToPublic, type PublicTestSessionDto } from './dtos/test-session.dto';
import { and, eq, inArray, sql } from 'drizzle-orm';

@injectable()
export class TestSessionsService {
	constructor(
		private testsSessionsRepository = container.resolve(TestSessionsRepository),
		private testsRepository = container.resolve(TestsRepository),
		private drizzleTransactionService = container.resolve(DrizzleTransactionService)
	) {}

	public async syncAnswers(
		testSessionId: string,
		testParticipantId: string,
		answers: {
			questionId: string;
			typedAnswer?: string;
			selectedOptionIds?: string[];
		}[]
	): Promise<void> {
		return this.drizzleTransactionService.runTransaction(async (tx) => {
			const existingParticipant = await tx.query.testSessionParticipantsTable.findFirst({
				where: and(
					eq(testSessionParticipantsTable.id, testParticipantId),
					eq(testSessionParticipantsTable.testSessionId, testSessionId)
				),
				with: {
					answers: true
				}
			});
			if (!existingParticipant) throw Unauthorized('Participant not found in session');

			const existingAnswers = existingParticipant.answers;

			tx.insert(participantAnswersTable).values(
				answers.map((a) => ({
					...a,
					testParticipantId
				}))
			).onConflictDoUpdate({
				target: participantAnswersTable.id,
				set: {
					typedAnswer: sql`excluded.typedAnswer`,
					// submittedAt: 
				}

			});

			const answersToDelete = [];
			const answersToUpsert = [];
			for (const answer of existingAnswers) {
				const isQuestionAnswerChanged = !answers.some((a) => a.questionId === answer.questionId);
				if (isQuestionAnswerChanged) {
					answersToDelete.push(answer);
				} else {
					answersToUpsert.push(answer);
				}
			}
			const existingAnswersToDelete = existingAnswers.filter(
				(answer) => !answers.some((a) => a.questionId === answer.questionId)
			);

			tx.delete(participantAnswersTable);

			// const [newAnswer] = await tx
			// 	.insert(participantAnswersTable)
			// 	.values({
			// 		testParticipantId,
			// 		questionId: incoming.questionId,
			// 		typedAnswer: incoming.typedAnswer || null
			// 		// You can also pass a default score or other fields here
			// 	})
			// 	.returning();

			// for (const incoming of answers) {
			// 	// 2. Check if we already have a participant_answers row for (testParticipantId, questionId)
			// 	const existingAnswer = await tx.query.participantAnswersTable.findFirst({
			// 		where: and(
			// 			eq(participantAnswersTable.testParticipantId, testParticipantId),
			// 			eq(participantAnswersTable.questionId, incoming.questionId)
			// 		)
			// 	});

			// 	let participantAnswerId: string;

			// 	// 3. If no row exists, create it. Otherwise, update the typedAnswer (if it changed).
			// 	if (!existingAnswer) {
			// 		const [newAnswer] = await tx
			// 			.insert(participantAnswersTable)
			// 			.values({
			// 				testParticipantId,
			// 				questionId: incoming.questionId,
			// 				typedAnswer: incoming.typedAnswer || null
			// 				// You can also pass a default score or other fields here
			// 			})
			// 			.returning();
			// 		participantAnswerId = newAnswer.id;
			// 	} else {
			// 		participantAnswerId = existingAnswer.id;
			// 		// If typed answer is different, update it
			// 		if (
			// 			incoming.typedAnswer !== undefined &&
			// 			incoming.typedAnswer !== existingAnswer.typedAnswer
			// 		) {
			// 			await tx
			// 				.update(participantAnswersTable)
			// 				.set({
			// 					typedAnswer: incoming.typedAnswer
			// 				})
			// 				.where(eq(participantAnswersTable.id, existingAnswer.id));
			// 		}
			// 	}

			// 	// 4. Handle multiple-choice “selectedOptionIds”
			// 	//    (If your question is typed only, skip this.)
			// 	if (incoming.selectedOptionIds) {
			// 		// a) Get the existing option entries from DB
			// 		const existingOptions = await tx.query.participantAnswerOptionsTable.findMany({
			// 			where: eq(participantAnswerOptionsTable.participantAnswerId, participantAnswerId)
			// 		});
			// 		const existingOptionIds = existingOptions.map((o) => o.optionId);

			// 		// b) Figure out which are new vs which to delete
			// 		const newOptionIds = incoming.selectedOptionIds;
			// 		const toRemove = existingOptionIds.filter((id) => !newOptionIds.includes(id));
			// 		const toAdd = newOptionIds.filter((id) => !existingOptionIds.includes(id));

			// 		// c) Delete old unselected options
			// 		if (toRemove.length > 0) {
			// 			await tx
			// 				.delete(participantAnswerOptionsTable)
			// 				.where(
			// 					and(
			// 						eq(participantAnswerOptionsTable.participantAnswerId, participantAnswerId),
			// 						inArray(participantAnswerOptionsTable.optionId, toRemove)
			// 					)
			// 				);
			// 		}

			// 		// d) Insert newly selected options
			// 		if (toAdd.length > 0) {
			// 			const rowsToInsert = toAdd.map((optionId) => ({
			// 				participantAnswerId,
			// 				optionId
			// 			}));
			// 			await tx.insert(participantAnswerOptionsTable).values(rowsToInsert);
			// 		}
			// 	}
			// }

			// Done! At this point, all typed answers and selected options have been synced.
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
