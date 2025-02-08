import { displayModes } from '@/constants/display-modes';
import { z } from 'zod';

export const createTestSessionDto = z.object({
	testId: z.string(),
	durationInMinutes: z.number(),
	displayMode: z.enum(displayModes),
	startTime: z.date().optional(),
	endTime: z.date().optional()
});

export type CreateTestSessionDto = z.infer<typeof createTestSessionDto>;
