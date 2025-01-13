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
         - If a question is related to code (e.g., a programming snippet, command-line instructions, etc.), you are free to include code blocks in the question.
         - Code blocks must be properly fenced with triple backticks, e.g. \`\`\`ts ... \`\`\`.
         - If the question does not require code, omit code blocks entirely.

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
