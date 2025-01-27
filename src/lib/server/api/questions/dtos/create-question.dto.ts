import { questionDto } from '@api/questions/dtos/question.dto';
import { z } from 'zod';

export const createQuestionDto = questionDto;

export type CreateQuestionDto = z.infer<typeof createQuestionDto>;
