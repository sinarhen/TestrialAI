import { z } from 'zod';
import { questionDto } from '@api/questions/dtos/question.dto';

export const testDto = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string(),
	questions: z.array(questionDto)
});

export type TestDto = z.infer<typeof testDto>;
