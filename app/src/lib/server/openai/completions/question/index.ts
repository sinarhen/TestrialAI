import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { questionSchema, type Difficulty, type Test } from '@/types/entities';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import type { CustomChatCompletionStreamParams } from '@/types/openai';
import { openai } from '../..';

const getMessages: (parameters: Parameters) => ChatCompletionMessageParam[] = ({
	topic,
	existingQuestions,
	testTitle,
	testDifficulty
}) => [
	{
		role: 'system',
		content: `
            You are a helpful assistant. Use the supplied tools to assist the user in generating a question to existing test.
            The test must follow these rules:
            - Question must match the user's specified topic, and difficulty.
            - Use "single" answer type for question with single correct answer, "multiple" for question with multiple 
                correct answers and "text" for questions with text-based answers. for question with text-based answers there is a field correctAnswer
            - Difficulty levels must match the user's specified difficulty: Easy, Medium, Hard.
            Format the test as valid JSON.
            `
	},
	{
		role: 'user',
		content: `Generate a question about ${topic} to the existing test with the title: ${testTitle}, with a difficulty of ${testDifficulty}. You can choose answer type from "single", "multiple" or "text". Don't repeat the following questions:
            ${existingQuestions.join(', ')}
            
        `
	}
];

export const generateQuestion = (
	parameters: Parameters,
	customCreateCompletionParams: CustomChatCompletionStreamParams = {
		model: 'gpt-4o'
	}
) =>
	openai.beta.chat.completions.stream({
		response_format: zodResponseFormat(questionSchema, 'generateQuestion'),
		messages: getMessages(parameters),
		...customCreateCompletionParams
	});

interface Parameters {
	topic: string;
	existingQuestions: string[];
	testTitle: string;
	testDifficulty: Difficulty;
}
