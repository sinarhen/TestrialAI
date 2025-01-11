import { openai } from '@/server/openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { testSchema, type Difficulty } from '@/types/entities';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import type { CustomChatCompletionStreamParams } from '@/types/openai';

export const getMessages: (parameters: Parameters) => ChatCompletionMessageParam[] = ({
	topic,
	difficulty,
	numberOfQuestions
}) => [
	{
		role: 'system',
		content: `
            You are a helpful assistant. Use the supplied tools to assist the user in generating a test.
            The test must follow these rules:
            - Questions must match the user's specified topic, number, and difficulty.
            - Use "single" answer type for questions with single correct answer, "multiple" for questions with multiple 
                correct answers and "text" for questions with text-based answers. for questions with text-based answers there is a field correctAnswer
            - Difficulty levels must match the user's specified difficulty: Easy, Medium, Hard.
            Format the test as valid JSON.
            `
	},
	{
		role: 'user',
		content: `Generate a test with ${numberOfQuestions} questions on the topic: ${topic}, with a difficulty of ${difficulty}.`
	}
];

export const generateTest = (
	parameters: Parameters,
	customChatCompletionParams: CustomChatCompletionStreamParams = {
		model: 'gpt-4o'
	}
) =>
	openai.beta.chat.completions.stream({
		response_format: zodResponseFormat(testSchema, 'generateTest'),
		messages: getMessages(parameters),

		...customChatCompletionParams
	});

interface Parameters {
	topic: string;
	difficulty: Difficulty;
	numberOfQuestions: number;
}
