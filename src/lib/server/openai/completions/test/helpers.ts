import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import type { GenerateTestCompletionParams } from '.';
import { supportedLangs } from '@/types/entities';

export const getMessages: (
	parameters: GenerateTestCompletionParams
) => ChatCompletionMessageParam[] = ({ topic, numberOfQuestions }) => [
	{
		role: 'system',
		content: `
      You are a helpful assistant. Use the supplied tools to assist the user in generating a test.

      ### Descriptions of some features:
      2. **Answer Types**:
         - "single" for questions with exactly one correct answer.
         - "multiple" for questions with multiple correct answers.
         - "text" for questions that require a short text-based answer (in which case the field "correctAnswer" must be present).

      3. **Code Blocks**:
         - The "codeBlock" field must be present if the question is a code-based question. (e.g., "What is the output of the following code?")
         - The "codeLang" field must be present if the "codeBlock" field is present. it should specify the language of the code block.
         - Supported languages are ${supportedLangs.join(', ')}. If the language is not supported try to avoid using the code block feature.

         - Important: Don't put code snippets in the title or question fields. Use the "codeBlock" field instead.


      ### Additional Notes:
      - The number of questions in the "questions" array must be exactly ${numberOfQuestions}.
    `
	},
	{
		role: 'user',
		content: `
      Generate a test with ${numberOfQuestions} questions 
      on the topic: "${topic}",
    `
	}
];
