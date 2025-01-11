import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { questionSchema, type Difficulty } from '@/types/entities';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import type { CustomChatCompletionStreamParams, QuestionModificationTool } from '@/types/openai';
import { openai } from '@/server/openai';

function getSystemContent(tool: QuestionModificationTool): string {
	switch (tool) {
		case 'simplify':
			return `
        You are a helpful assistant. Use the supplied tools to simplify a question in an existing test.
        The question must follow these rules:
        - Must match the user's specified topic exactly, but with simplified language.
        - Use "single", "multiple", or "text" for the question's answer type. If "text", should include a "correctAnswer" with the correct answer.
        - Difficulty must match exactly: Easy, Medium, Hard.
        - Format the question as valid JSON.
      `;
		case 'rephrase':
			return `
        You are a helpful assistant. Use the supplied tools to rephrase a question in an existing test.
        The question must follow these rules:
        - Must match the user's specified topic exactly, but expressed in a different way.
        - Use "single", "multiple", or "text" for the question's answer type. If "text", should include a "correctAnswer" with the correct answer.
        - Difficulty must remain the same: Easy, Medium, Hard.
        - Format the question as valid JSON.
      `;
		case 'complicate':
			return `
        You are a helpful assistant. Use the supplied tools to complicate a question in an existing test.
        The question must follow these rules:
        - Must match the user's specified topic exactly, but with a more challenging or complex phrasing.
        - Use "single", "multiple", or "text" for the question's answer type. If "text", should include a "correctAnswer" with the correct answer.
        - Difficulty must match exactly: Easy, Medium, Hard.
        - Format the question as valid JSON.
      `;
		default:
			return `
        You are a helpful assistant. Use the supplied tools to assist the user with modifying a question 
        in an existing test. Format the question as valid JSON.
      `;
	}
}

function getUserContent(params: Parameters): string {
	const { tool, questionTopic: topic, existingQuestions, testTitle, testDifficulty } = params;
	const toolVerb =
		tool === 'simplify'
			? 'simplify'
			: tool === 'rephrase'
				? 'rephrase'
				: tool === 'complicate'
					? 'complicate'
					: 'modify';

	return `
    Regenerate a question about "${topic}" for the existing test titled "${testTitle}", 
    with a difficulty of "${testDifficulty}".  
    Don't repeat the following questions: ${existingQuestions.join(', ')}.
    Please ${toolVerb} the question accordingly.
  `;
}

// 2) Consolidate both system and user messages
const getMessages = (params: Parameters): ChatCompletionMessageParam[] => {
	return [
		{
			role: 'system',
			content: getSystemContent(params.tool)
		},
		{
			role: 'user',
			content: getUserContent(params)
		}
	];
};

export const regenerateQuestionWithTool = (
	parameters: Parameters,
	customCreateCompletionParams: CustomChatCompletionStreamParams = {
		model: 'gpt-4o'
	}
) =>
	openai.beta.chat.completions.stream({
		response_format: zodResponseFormat(questionSchema, parameters.tool),
		messages: getMessages(parameters),
		...customCreateCompletionParams
	});

interface Parameters {
	tool: QuestionModificationTool;
	questionTopic: string;
	existingQuestions: string[];
	testTitle: string;
	testDifficulty: Difficulty;
}
