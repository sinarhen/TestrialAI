import { questionDto } from '@api/questions/dtos/question.dto';
import { z } from 'zod';

export const updateQuestionDto = questionDto.partial();
export type UpdateQuestionDto = z.infer<typeof updateQuestionDto>;
