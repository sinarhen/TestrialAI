import { z } from 'zod';

export const generateCodeBlockParamsDto = z.object({
	question: z.string(),
	testTitle: z.string(),
	previousCodeBlock: z.string().optional()
});

export type GenerateCodeBlockParams = z.infer<typeof generateCodeBlockParamsDto>;
