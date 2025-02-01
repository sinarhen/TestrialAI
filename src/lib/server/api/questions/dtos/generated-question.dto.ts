import { z } from 'zod';
import { questionDto } from './question.dto';

export const generatedQuestionDto = questionDto.omit({ id: true });

export type GeneratedQuestionDto = z.infer<typeof generatedQuestionDto>;
