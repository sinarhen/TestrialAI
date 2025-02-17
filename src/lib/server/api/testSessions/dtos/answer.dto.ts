import { z } from 'zod';

export const answerDto = z.object({
	questionId: z.string(),
	typedAnswer: z.string().optional(),
	selectedOptionIds: z.array(z.string()).optional()
});

export type AnswerDto = z.infer<typeof answerDto>;
