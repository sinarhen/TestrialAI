import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import type { GenerateQuestionCompletionParams } from '.';

export const getMessages: (
	parameters: GenerateQuestionCompletionParams
) => ChatCompletionMessageParam[] = ({ topic, existingQuestions, testTitle }) => [
	{
		role: 'system',
		content: `
		You are a helpful assistant. Use the supplied tools to assist the user in generating a new question for an existing test.
  
		### Rules:
		3. **Answer Types**:
		   - "single" for a question with a single correct answer.
		   - "multiple" for a question with multiple correct answers.
		   - "text" for a question that requires a text-based answer (with "correctAnswer" field included).
		4. **Non-Repetition**: Do not repeat any of the existing questions provided by the user.

		3. **Code Blocks**:
		- If a question is related to code (e.g., a programming snippet, etc.), you are free to add 'codeBlock' and 'codeLang' fields.
		- Code block should only include code snippets without triple backticks  
		
		Remember not to repeat any existing questions:
		${existingQuestions.join(', ')}.
	  `
	},
	{
		role: 'user',
		content: `
		Generate a question about ${topic} for the test titled "${testTitle}". 
		You can choose any answer type you want: "single", "multiple", or "text".

		The question should not repeat any of the existing questions:
		${existingQuestions.join(', ')}
	  `
	}
];
