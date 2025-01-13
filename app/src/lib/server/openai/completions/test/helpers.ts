import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import type { GenerateQuestionCompletionParams } from '../question';
import type { GenerateTestCompletionParams } from '.';

export const getMessages: (
	parameters: GenerateTestCompletionParams
) => ChatCompletionMessageParam[] = ({ topic, numberOfQuestions }) => [
	{
		role: 'system',
		content: `
      You are a helpful assistant. Use the supplied tools to assist the user in generating a test.

      ### Requirements:
      1. **Topic and Number of Questions**:
         - The generated test must have exactly ${numberOfQuestions} questions.
         - Each question must be relevant to the topic: "${topic}".

      2. **Answer Types**:
         - "single" for questions with exactly one correct answer.
         - "multiple" for questions with multiple correct answers.
         - "text" for questions that require a short text-based answer (in which case the field "correctAnswer" must be present).

      3. **Code Blocks**:
         - If a question requires a code block, the "codeBlock" field must be present.
         - The "codeLang" field must be present if the "codeBlock" field is present. it should specify the language of the code block.
         - The "isCodeSnippet" field must be set to "true" for code snippets.
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
