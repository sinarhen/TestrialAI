import { questionSchema } from '@/types/entities';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import type { CustomChatCompletionParams, QuestionModificationTool } from '@/types/openai';
import { openai } from '@/server/openai';
import { getMessages } from './helpers';

export const regenerateQuestionWithTool = (
	parameters: GenerateQuestionWithToolCompletionParams,
	customCreateCompletionParams: CustomChatCompletionParams = {
		model: 'gpt-4o'
	}
) =>
	openai.beta.chat.completions.stream({
		response_format: zodResponseFormat(questionSchema, parameters.tool),
		messages: getMessages(parameters),
		...customCreateCompletionParams
	});

export interface GenerateQuestionWithToolCompletionParams {
	tool: QuestionModificationTool;
	questionTopic: string;
	existingQuestions: string[];
	testTitle: string;
}
