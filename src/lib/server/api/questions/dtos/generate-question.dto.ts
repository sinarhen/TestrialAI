import { z } from 'zod';

export const generateQuestionDto = z.object({
	topic: z.string()
});

export type GenerateQuestionDto = z.infer<typeof generateQuestionDto>;
