import type { CustomChatCompletionStreamParams } from '@/types/openai';
import { openai } from '@/server/openai';
import { getMessages } from './helpers';

export const generateCodeBlock = (
	parameters: GenerateCodeBlockCompletionParams,
	customCreateCompletionParams: CustomChatCompletionStreamParams = {
		model: 'gpt-4o'
	}
) =>
	openai.beta.chat.completions.stream({
		messages: getMessages(parameters),
		...customCreateCompletionParams
	});

export interface GenerateCodeBlockCompletionParams {
	question: string;
	testTitle: string;
	previousCodeBlock?: string;
}
