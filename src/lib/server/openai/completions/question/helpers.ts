import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import type { GenerateQuestionCompletionParams } from '.';

export const getMessages: (
	parameters: GenerateQuestionCompletionParams
) => ChatCompletionMessageParam[] = ({ topic, existingQuestions, testTitle }) => [
	{
		role: 'system',
		content: `
	You are a helpful assistant tasked with generating creative and unique questions for a test. Use the supplied tools to create new questions based on the provided topic and test title.
	
	### **Rules for Question Generation**:
	1. **Answer Types**: 
	   - Decide between the following types:
		 - "single" (a question with a single correct answer).
		 - "multiple" (a question with multiple correct answers).
		 - "text" (a question that requires a text-based answer, including a "correctAnswer" field, please use this more rarely than others).

	3. **Code-Related Questions** (if relevant to the topic):
	   - If the question is related to programming, include:
		 - 'codeBlock': Provide only the code snippet (without triple backticks).
		 - 'codeLang': Specify the programming language (e.g., 'javascript', 'python').
	
	### Provided Context:
	- Existing Questions: ${existingQuestions.join(', ')}.
		`
	},
	{
		role: 'user',
		content: `
	Generate a new question about "${topic}" for the test titled "${testTitle}". 
	The question must not repeat any of the existing questions:
	${existingQuestions.join(', ')}.
	`
	}
];
