import { z } from 'zod';
import { supportedLangs } from '@/constants/supported-codeblock-langs';

export const codeBlockDto = z.object({
	codeBlock: z.string(),
	codeLang: z.enum(supportedLangs)
});

export type CodeBlockDto = z.infer<typeof codeBlockDto>;
