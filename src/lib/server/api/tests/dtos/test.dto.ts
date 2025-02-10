import { z } from 'zod';
import { publicQuestionDto, questionDto } from '@api/questions/dtos/question.dto';

export const testDto = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	questions: z.array(questionDto)
});

export const publicTestDto = testDto.omit({ questions: true }).extend({
	questions: z.array(publicQuestionDto)
});

export type TestDto = z.infer<typeof testDto>;
