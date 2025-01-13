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
		1. **Relevance**: The generated question must match the user's specified topic, and test title.
		3. **Answer Types**:
		   - "single" for a question with a single correct answer.
		   - "multiple" for a question with multiple correct answers.
		   - "text" for a question that requires a text-based answer (with "correctAnswer" field included).
		4. **Non-Repetition**: Do not repeat any of the existing questions provided by the user.
		5. **Code Blocks**:
		   - If the question pertains to code (e.g. a programming question), you are free to include one code block in the question text. 
           - Format code blocks using triple backticks (e.g., \`\`\`ts ... \`\`\`).
           - If you include a code block, ensure that it is relevant and helpful for the question.
		   - If the question does not need code, omit the code block.

		
		Note that the question can include a code block inside the string, e.g.:
  
		"question": "What does this code do? \n\`\`\`ts\nconsole.log('Hello, world!');\n\`\`\`"
  
		Remember not to repeat any existing questions:
		${existingQuestions.join(', ')}.
	  `
	},
	{
		role: 'user',
		content: `
		Generate a question about ${topic} for the test titled "${testTitle}". 
		You can choose from "single", "multiple", or "text" question types. 
		Do not repeat any of these existing questions:
		${existingQuestions.join(', ')}
	  `
	}
];
