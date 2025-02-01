import { testDto } from './test.dto';
import { generatedQuestionDto } from '../../questions/dtos/question.dto';
import { z } from 'zod';

export const generatedTestDto = testDto.omit({ id: true, questions: true }).extend({
	questions: z.array(generatedQuestionDto)
});

export type GeneratedTestDto = z.infer<typeof generatedTestDto>;
