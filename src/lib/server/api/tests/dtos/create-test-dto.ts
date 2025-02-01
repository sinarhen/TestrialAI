import { z } from 'zod';
import { testDto } from './test.dto';
import { createQuestionDto } from '../../questions/dtos/create-question.dto';

export const createTestDto = testDto.omit({ id: true, questions: true }).extend({
	questions: z.array(createQuestionDto)
});
export type CreateTestDto = z.infer<typeof createTestDto>;
