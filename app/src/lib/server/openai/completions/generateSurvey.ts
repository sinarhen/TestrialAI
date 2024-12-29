import { openai } from '@/server/openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { surveySchema, type Difficulty, type Survey } from '@/types/entities';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import _ from 'lodash';
import type { ChatCompletionCreateParams } from 'openai/resources/index.mjs';
import type { ChatCompletionStreamParams } from 'openai/lib/ChatCompletionStream';
import type { CustomChatCompletionStreamParams } from '@/types/openai';

export const getMessages: (parameters: Parameters) => ChatCompletionMessageParam[] = ({
	topic,
	difficulty,
	numberOfQuestions
}) => [
	{
		role: 'system',
		content: `
            You are a helpful assistant. Use the supplied tools to assist the user in generating a survey.
            The survey must follow these rules:
            - Questions must match the user's specified topic, number, and difficulty.
            - Use "single" answer type for questions with single correct answer, "multiple" for questions with multiple 
                correct answers and "text" for questions with text-based answers. for questions with text-based answers there is a field correctAnswer
            - Difficulty levels must match the user's specified difficulty: Easy, Medium, Hard.
            Format the survey as valid JSON.
            `
	},
	{
		role: 'user',
		content: `Generate a survey with ${numberOfQuestions} questions on the topic: ${topic}, with a difficulty of ${difficulty}.`
	}
];

export const generateSurvey = (
	parameters: Parameters,
	customChatCompletionParams: CustomChatCompletionStreamParams = {
		model: 'gpt-4o'
	}
) =>
	openai.beta.chat.completions.stream({
		response_format: zodResponseFormat(surveySchema, 'generateSurvey'),
		messages: getMessages(parameters),

		...customChatCompletionParams
	});

interface Parameters {
	topic: string;
	difficulty: Difficulty;
	numberOfQuestions: number;
}
