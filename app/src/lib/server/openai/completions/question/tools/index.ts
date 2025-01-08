import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { questionSchema, type Difficulty } from '@/types/entities';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import type { CustomChatCompletionStreamParams } from '@/types/openai';
import { openai } from '@/server/openai';

function getSystemContent(tool: Tool): string {
	switch (tool) {
		case 'simplify':
			return `
        You are a helpful assistant. Use the supplied tools to simplify a question in an existing survey.
        The question must follow these rules:
        - Must match the user's specified topic exactly, but with simplified language.
        - Use "single", "multiple", or "text" for the question's answer type.
        - Difficulty must match exactly: Easy, Medium, Hard.
        - Format the question as valid JSON.
      `;
		case 'rephrase':
			return `
        You are a helpful assistant. Use the supplied tools to rephrase a question in an existing survey.
        The question must follow these rules:
        - Must match the user's specified topic exactly, but expressed in a different way.
        - Use "single", "multiple", or "text" for the question's answer type.
        - Difficulty must remain the same: Easy, Medium, Hard.
        - Format the question as valid JSON.
      `;
		case 'complicate':
			return `
        You are a helpful assistant. Use the supplied tools to complicate a question in an existing survey.
        The question must follow these rules:
        - Must match the user's specified topic exactly, but with a more challenging or complex phrasing.
        - Use "single", "multiple", or "text" for the question's answer type.
        - Difficulty must match exactly: Easy, Medium, Hard.
        - Format the question as valid JSON.
      `;
		default:
			return `
        You are a helpful assistant. Use the supplied tools to assist the user with modifying a question 
        in an existing survey. Format the question as valid JSON.
      `;
	}
}

function getUserContent(
	tool: Tool,
	topic: string,
	existingQuestions: string[],
	surveyTitle: string,
	surveyDifficulty: Difficulty
): string {
	const toolVerb =
		tool === 'simplify'
			? 'simplify'
			: tool === 'rephrase'
				? 'rephrase'
				: tool === 'complicate'
					? 'complicate'
					: 'modify';

	return `
    Regenerate a question about "${topic}" for the existing survey titled "${surveyTitle}", 
    with a difficulty of "${surveyDifficulty}".  
    Don't repeat the following questions: ${existingQuestions.join(', ')}.
    Please ${toolVerb} the question.
    Please ${toolVerb} the question accordingly.
  `;
}

// 2) Consolidate both system and user messages
const getMessages = ({
	tool,
	topic,
	existingQuestions,
	surveyTitle,
	surveyDifficulty
}: Parameters): ChatCompletionMessageParam[] => {
	return [
		{
			role: 'system',
			content: getSystemContent(tool)
		},
		{
			role: 'user',
			content: getUserContent(tool, topic, existingQuestions, surveyTitle, surveyDifficulty)
		}
	];
};

export const modifyQuestion = (
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

type Tool = 'simplify' | 'rephrase' | 'complicate';

interface Parameters {
	tool: Tool;
	topic: string;
	existingQuestions: string[];
	surveyTitle: string;
	surveyDifficulty: Difficulty;
}
