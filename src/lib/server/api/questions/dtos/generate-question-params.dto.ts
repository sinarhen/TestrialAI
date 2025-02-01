import { z } from 'zod';

export const generateQuestionParamsDto = z.object({
	topic: z.string(),
	existingQuestions: z.array(z.string()),
	testTitle: z.string()
});

export type GenerateQuestionParamsDto = z.infer<typeof generateQuestionParamsDto>;
