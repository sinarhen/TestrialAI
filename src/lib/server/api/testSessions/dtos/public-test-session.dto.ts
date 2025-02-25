import { displayModes } from '@/shared/constants/display-modes';
import { z } from 'zod';
import { publicTestDto, mapTestToPublic } from '../../tests/dtos/test.dto';
import { answerDto } from './answer.dto';
import type { TestSessionWithRelations } from '../tables';

export const publicTestSessionDto = z.object({
	id: z.string(),
	code: z.string(),
	startTime: z.number(),
	endTime: z.number(),
	durationInMinutes: z.number(),
	testStateJson: publicTestDto,
	displayMode: z.enum(displayModes),
	participantsCount: z.number(),
	participantAnswers: z.array(answerDto).nullable(),
	timeLeft: z.number().nullable()
});
export function mapTestSessionToPublic(
	testSession: Omit<TestSessionWithRelations, 'participants'> & {
		participants?: TestSessionWithRelations['participants'];
	}
): PublicTestSessionDto {
	const timeLeft =
		testSession.durationInMinutes && testSession.participants?.[0]?.startedAt
			? Math.max(
					0,
					testSession.durationInMinutes * 60 -
						(Date.now() - Number(testSession.participants?.[0]?.startedAt)) / 1000
				)
			: null;

	return {
		id: testSession.id,
		code: testSession.code,
		startTime: Number(testSession.startTime),
		endTime: Number(testSession.endTime),
		durationInMinutes: Number(testSession.durationInMinutes),
		testStateJson: mapTestToPublic(testSession.testStateJson),
		displayMode: testSession.displayMode,
		participantsCount: testSession.participants?.length ?? 0,
		participantAnswers:
			testSession.participants?.[0]?.answers.map((answer) => ({
				questionId: answer.questionId,
				typedAnswer: answer.typedAnswer ?? undefined,
				selectedOptionIds: answer.selectedOptionIds ?? undefined
			})) || null,
		timeLeft
	};
}

export type PublicTestSessionDto = z.infer<typeof publicTestSessionDto>;
