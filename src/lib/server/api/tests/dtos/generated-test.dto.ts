import { testDto } from './test.dto';
import { generatedQuestionDto } from '../../questions/dtos/question.dto';
import { z } from 'zod';
import type { DeepPartial } from '../../common/utils/deep-partial';

export const generatedTestDto = testDto.omit({ id: true, questions: true }).extend({
	questions: z.array(generatedQuestionDto)
});

export type GeneratedTestDto = z.infer<typeof generatedTestDto>;
export type GeneratingTestDto = DeepPartial<GeneratedTestDto>;
