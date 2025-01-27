import { questionSchema } from '@/types/entities';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import type { CustomChatCompletionParams } from '@/types/openai';
import { openai } from '../..';
import { getMessages } from './helpers';

export const generateQuestion = (
	parameters: GenerateQuestionCompletionParams,
	customCreateCompletionParams: CustomChatCompletionParams = {
		model: 'gpt-4o'
	}
) =>
	openai.beta.chat.completions.stream({
		messages: getMessages(parameters),
		...customCreateCompletionParams,
		response_format: zodResponseFormat(questionSchema, 'generateQuestion')
	});

export interface GenerateQuestionCompletionParams {
	topic: string;
	existingQuestions: string[];
	testTitle: string;
}
