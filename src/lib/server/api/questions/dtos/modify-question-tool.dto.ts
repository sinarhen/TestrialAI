import { z } from 'zod';

export const modifyQuestionToolDto = z.object({
	tool: z.enum(['simplify', 'rephrase', 'harder'])
});

export type ModifyQuestionToolDto = z.infer<typeof modifyQuestionToolDto>;
export type ModifyQuestionTool = ModifyQuestionToolDto['tool'];
