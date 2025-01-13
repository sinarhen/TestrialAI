import { questionSchema } from '@/types/entities';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import type { CustomChatCompletionStreamParams } from '@/types/openai';
import { openai } from '../..';
import { getMessages } from './helpers';

export const generateQuestion = (
	parameters: GenerateQuestionCompletionParams,
	customCreateCompletionParams: CustomChatCompletionStreamParams = {
		model: 'gpt-4o'
	}
) =>
	openai.beta.chat.completions.stream({
		response_format: zodResponseFormat(questionSchema, 'generateQuestion'),
		messages: getMessages(parameters),
		...customCreateCompletionParams
	});

export interface GenerateQuestionCompletionParams {
	topic: string;
	existingQuestions: string[];
	testTitle: string;
}
