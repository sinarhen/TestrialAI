import { displayModes } from '@/shared/constants/display-modes';
import { z } from 'zod';
import { testDto } from '../../tests/dtos/test.dto';
import type { TestSessionWithRelations } from '../tables';
export const testSessionDto = z.object({
	id: z.string(),
	// testId: z.string(),
	code: z.string(),
	startTime: z.number(),
	endTime: z.number(),
	durationInMinutes: z.number(),
	testStateJson: testDto,
	displayMode: z.enum(displayModes),
	participantsCount: z.number()
});

export function mapTestSession(testSession: TestSessionWithRelations): TestSessionDto {
	return {
		id: testSession.id,
		code: testSession.code,
		startTime: Number(testSession.startTime),
		endTime: Number(testSession.endTime),
		durationInMinutes: Number(testSession.durationInMinutes),
		testStateJson: testSession.testStateJson,
		displayMode: testSession.displayMode,
		participantsCount: testSession.participants.length
	};
}

export type TestSessionDto = z.infer<typeof testSessionDto>;
