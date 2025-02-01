import { z } from 'zod';

export const generateTestParamsDto = z.object({
	topic: z.string(),
	numberOfQuestions: z.number()
});

export type GenerateTestParamsDto = z.infer<typeof generateTestParamsDto>;
