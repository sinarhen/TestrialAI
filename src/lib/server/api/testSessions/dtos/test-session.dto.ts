import { displayModes } from '@/constants/display-modes';
import { z } from 'zod';
import { testDto } from '../../tests/dtos/test.dto';

export const testSessionDto = z.object({
	id: z.string(),
	// testId: z.string(),
	code: z.string(),
	startTime: z.number(),
	endTime: z.number(),
	durationInMinutes: z.number(),
	testStateJson: testDto,
	displayMode: z.enum(displayModes)
});

export type TestSessionDto = z.infer<typeof testSessionDto>;
