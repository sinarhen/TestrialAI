import { z } from 'zod';

export const generateTestDto = z.object({
	topic: z.string(),
	numberOfQuestions: z.number()
});

export type GenerateTestDto = z.infer<typeof generateTestDto>;
