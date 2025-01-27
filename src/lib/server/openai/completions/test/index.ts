import { openai } from '@/server/openai';
import { testSchema } from '@/types/entities';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import type { CustomChatCompletionParams } from '@/types/openai';
import { getMessages } from './helpers';

export const generateTest = (
	parameters: GenerateTestCompletionParams,
	customChatCompletionParams: CustomChatCompletionParams = {
		model: 'gpt-4o'
	}
) =>
	openai.beta.chat.completions.stream({
		response_format: zodResponseFormat(testSchema, 'generateTest'),
		messages: getMessages(parameters),
		...customChatCompletionParams
	});
