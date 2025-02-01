import { generatedQuestionDto } from '@api/questions/dtos/question.dto';
import { z } from 'zod';
import { optionDto } from './option/option.dto';

export const createQuestionDto = generatedQuestionDto.omit({ options: true }).extend({
	options: z.array(optionDto)
});

export type CreateQuestionDto = z.infer<typeof createQuestionDto>;
