import type { QuestionModificationTool } from '@/types/openai';
import type { GenerateQuestionWithToolCompletionParams } from '.';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

function getSystemContent(tool: QuestionModificationTool): string {
	switch (tool) {
		case 'simplify':
			return `
        You are a helpful assistant. Use the supplied tools to simplify an existing question in a test.

        ### What "Simplify" Means
        - Keep the topic the same, but make the question simpler.

        ### Rules
        1. **Topic**: Must match the user’s specified topic exactly.
        3. **Answer Type**: 
           - "single" for one correct answer,
           - "multiple" for multiple correct answers,
           - "text" for a short text-based answer (in which case include "correctAnswer").
        4. **Code Blocks**: 
           - If the question is about code (e.g., programming snippet), you are free to use property 'codeBlock' with a code snippet and 'lang' property with the language of the code.(e.g. {"codeBlock": "console.log('Hello, world!');", "lang": "javascript"}).
        5. **Valid JSON**:
           - The output must be valid JSON matching the "questionSchema".

        ### Final Output
        - Provide only the JSON (no extra text).
      `;
		case 'rephrase':
			return `
        You are a helpful assistant. Use the supplied tools to rephrase an existing question in a test.

        ### What "Rephrase" Means
        - Keep the topic the same, but alter the wording so the question is expressed differently.
        - Do not change the core meaning or the correct answers.

        ### Rules
        1. **Topic**: Must match the user’s specified topic exactly.
        3. **Answer Type**:
           - "single" for one correct answer,
           - "multiple" for multiple correct answers,
           - "text" for a short text-based answer (include "correctAnswer").
        4. **Code Blocks**: 
           - If the question is about code (e.g., programming snippet), you are free to use property 'codeBlock' with a code snippet and 'lang' property with the language of the code.(e.g. {"codeBlock": "console.log('Hello, world!');", "lang": "javascript"}).
        5. **Valid JSON**:
           - The output must be valid JSON matching the "questionSchema".

        ### Final Output
        - Provide only the JSON (no extra text).
      `;
		case 'harder':
			return `
        You are a helpful assistant. Use the supplied tools to make an existing question harder in a test.

        ### What "Harder" Means
        - New question should be somehow related to the initial version, but much more challenging.
        - This might involve adding more context, deeper reasoning steps, or advanced terminology (while staying on the same topic).

        ### Rules
        1. **Topic**: Must match the user’s specified topic exactly.
        3. **Answer Type**:
           - "single" for one correct answer,
           - "multiple" for multiple correct answers,
           - "text" for a short text-based answer (include "correctAnswer").
        4. **Code Blocks**:
           - If the question is about code (e.g., programming snippet), you are free to include code blocks using triple backticks (e.g. \`\`\`ts ... \`\`\`).
           - Otherwise, omit code blocks.
        5. **Valid JSON**:
           - The output must be valid JSON matching the "questionSchema".

        ### Final Output
        - Provide only the JSON (no extra text).
      `;
		default:
			return `
        You are a helpful assistant. Use the supplied tools to modify an existing question in a test.

        ### General Rules
        - Keep the question's topic, and answer type valid.
        - If code is relevant, use triple backticks. Otherwise, omit code blocks.
        - The output must be valid JSON matching "questionSchema".

        ### Final Output
        - Only JSON, no extra commentary.
      `;
	}
}

function getUserContent(params: GenerateQuestionWithToolCompletionParams): string {
	const { tool, questionTopic: topic, existingQuestions, testTitle } = params;
	const toolVerb =
		tool === 'simplify'
			? 'simplify'
			: tool === 'rephrase'
				? 'rephrase'
				: tool === 'harder'
					? 'make more challenging'
					: 'modify';

	return `
    Regenerate (i.e., ${toolVerb}) a question about "${topic}" 
    in the existing test titled "${testTitle}",
    Do not repeat the following questions: ${existingQuestions.join(', ')}.
    Please ${toolVerb} the question accordingly.
  `;
}

export const getMessages = (
	params: GenerateQuestionWithToolCompletionParams
): ChatCompletionMessageParam[] => [
	{
		role: 'system',
		content: getSystemContent(params.tool)
	},
	{
		role: 'user',
		content: getUserContent(params)
	}
];
