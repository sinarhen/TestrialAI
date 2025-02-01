import { z } from 'zod';
import { modifyQuestionToolDto } from './modify-question-tool.dto';

export const regenerateQuestionParamsDto = z.object({
	tool: modifyQuestionToolDto.shape.tool,
	questionTopic: z.string(),
	existingQuestions: z.array(z.string()),
	testTitle: z.string()
});

export type RegenerateQuestionParams = z.infer<typeof regenerateQuestionParamsDto>;
