import type { CustomChatCompletionParams } from '@/types/openai';
import { openai } from '@/server/openai';
import { getMessages } from './helpers';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import { codeBlockCompletionSchema } from '@/types/entities';

export const generateCodeBlock = (
	parameters: GenerateCodeBlockCompletionParams,
	customCreateCompletionParams: CustomChatCompletionParams = {
		model: 'gpt-4o'
	}
) =>
	openai.beta.chat.completions.stream({
		response_format: zodResponseFormat(codeBlockCompletionSchema, 'generateCodeBlock'),
		messages: getMessages(parameters),
		...customCreateCompletionParams
	});

export interface GenerateCodeBlockCompletionParams {
	question: string;
	testTitle: string;
	previousCodeBlock?: string;
}
