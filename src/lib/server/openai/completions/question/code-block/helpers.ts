import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import type { GenerateCodeBlockCompletionParams } from '.';

export const getMessages: (
	parameters: GenerateCodeBlockCompletionParams
) => ChatCompletionMessageParam[] = ({ question, testTitle, previousCodeBlock }) => [
	{
		role: 'system',
		content: `
		You are a helpful assistant. Use the supplied tools to assist the user in generating a code block for the question in an existing test.
        code block is a feature that allows you to include code snippets in your question if it is related to code.
        I want you to generate a code block for the question in an existing test.
        This code block should be some kind of really tiny hint or a small piece of code that will help the user to answer the question.
	  `
	},
	{
		role: 'user',
		content: `
        Generate a code block for the question in an existing test.
        Question: "${question}"
        Test Title: "${testTitle}
        ${previousCodeBlock ? `Previous Code Block: ${previousCodeBlock}` : ''}
	  `
	}
];
