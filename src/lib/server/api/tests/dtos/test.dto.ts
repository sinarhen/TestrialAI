import { z } from 'zod';
import { questionDto } from '@api/questions/dtos/question.dto';
import type { DeepPartial } from '../../common/utils/deep-partial';

export const testDto = z.object({
	title: z.string(),
	description: z.string(),
	questions: z.array(questionDto)
});

export type TestDto = z.infer<typeof testDto>;
export type CreateTestDto = TestDto;

export type GeneratingTestDto = DeepPartial<TestDto>;
