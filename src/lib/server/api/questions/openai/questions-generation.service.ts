import { injectable } from '@needle-di/core';
import { OpenAiBaseService } from '@api/common/factories/openai-service.factory';
import { questionDto } from '@api/questions/dtos/question.dto';
import { codeBlockDto } from '@api/questions/dtos/code-block/code-block.dto';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import type { ModifyQuestionTool } from '@api/questions/dtos/modify-question-tool.dto';

interface GenerateQuestionParams {
	topic: string;
	existingQuestions: string[];
	testTitle: string;
}

interface RegenerateQuestionParams {
	tool: ModifyQuestionTool;
	questionTopic: string;
	existingQuestions: string[];
	testTitle: string;
}

interface GenerateCodeBlockParams {
	question: string;
	testTitle: string;
	previousCodeBlock?: string;
}

@injectable()
export class QuestionsGenerationService extends OpenAiBaseService {
	/* --------------------- Public API Methods ----------------------- */
	streamGenerateQuestion(params: GenerateQuestionParams) {
		return this.createCompletion(questionDto, {
			messages: this.buildGenerateQuestionMessages(params),
			stream: true
		});
	}

	streamRegenerateQuestion(params: RegenerateQuestionParams) {
		return this.createCompletion(questionDto, {
			messages: this.buildRegenerateQuestionMessages(params),
			stream: true
		});
	}

	streamGenerateCodeBlock(params: GenerateCodeBlockParams) {
		const messages = this.buildGenerateCodeBlockMessages(params);
		return this.createCompletion(codeBlockDto, {
			messages,
			stream: true
		});
	}

	/* --------------------- Private Builders ----------------------- */

	private buildGenerateQuestionMessages(
		params: GenerateQuestionParams
	): ChatCompletionMessageParam[] {
		return [
			{
				role: 'system',
				content: GENERATE_QUESTION_SYSTEM_PROMPT
			},
			{
				role: 'user',
				content: this.buildGenerateQuestionUserPrompt(params)
			}
		];
	}

	private buildRegenerateQuestionMessages(
		params: RegenerateQuestionParams
	): ChatCompletionMessageParam[] {
		return [
			{
				role: 'system',
				content: REGENERATE_QUESTION_SYSTEM_PROMPT
			},
			{
				role: 'user',
				content: this.buildRegenerateQuestionUserPrompt(params)
			}
		];
	}

	/**
	 * Build messages for generating a code block.
	 */
	private buildGenerateCodeBlockMessages(
		params: GenerateCodeBlockParams
	): ChatCompletionMessageParam[] {
		return [
			{
				role: 'system',
				content: GENERATE_CODE_BLOCK_SYSTEM_PROMPT
			},
			{
				role: 'user',
				content: this.buildGenerateCodeBlockUserPrompt(params)
			}
		];
	}

	/* --------------------- Private Prompt Content ----------------------- */

	private buildGenerateQuestionUserPrompt({
		topic,
		existingQuestions,
		testTitle
	}: GenerateQuestionParams): string {
		return `
Generate a new question about "${topic}" for the test titled "${testTitle}".
Avoid repeating any existing questions:
${existingQuestions.join(', ')}.
        `;
	}

	private buildRegenerateQuestionUserPrompt(params: RegenerateQuestionParams): string {
		const toolVerb = this.getToolVerb(params.tool);
		return `
Regenerate (i.e., ${toolVerb}) a question about "${params.questionTopic}"
in the existing test titled "${params.testTitle}".
Avoid repeating these existing questions: ${params.existingQuestions.join(', ')}.
Please ${toolVerb} the question accordingly.
        `;
	}

	private buildGenerateCodeBlockUserPrompt({
		question,
		testTitle,
		previousCodeBlock
	}: GenerateCodeBlockParams): string {
		return `
				Generate a code block for this question in the test titled "${testTitle}":
				Question: "${question}"
				${previousCodeBlock ? `Previous Code Block: ${previousCodeBlock}` : ''}
        `;
	}

	/**
	 * Helper to convert the tool type into a verb or short phrase.
	 */
	private getToolVerb(tool: ModifyQuestionTool): string {
		switch (tool) {
			case 'simplify':
				return 'simplify';
			case 'rephrase':
				return 'rephrase';
			case 'harder':
				return 'make more challenging';
			default:
				return 'modify';
		}
	}
}

const GENERATE_QUESTION_SYSTEM_PROMPT = `
You are a helpful assistant tasked with generating creative and unique questions for a test.
Use the supplied tools to create new questions based on the provided topic and test title.

### Rules for Question Generation
1. **Answer Types**:
   - "single": a question with a single correct answer
   - "multiple": a question with multiple correct answers
   - "text": a short text-based answer, include "correctAnswer" (used more rarely)

2. **Code-Related Questions** (if relevant):
   - If the question relates to programming, add:
     - 'codeBlock': snippet only (no triple backticks)
     - 'codeLang': the programming language (e.g., 'javascript', 'python')
`;

const REGENERATE_QUESTION_SYSTEM_PROMPT = `
You are a helpful assistant who modifies existing test questions. Possible modifications:
• "simplify": same topic, simpler wording.
• "rephrase": restate without changing meaning or correct answers.
• "harder": more advanced/challenging but same topic.
• "general": generic modifications.

Rules:
1. Keep the same topic.
2. Valid answer types: "single", "multiple", or "text" (include "correctAnswer").
3. If code is relevant, use "codeBlock" + "lang".
`;

const GENERATE_CODE_BLOCK_SYSTEM_PROMPT = `
You are a helpful assistant. Generate a code snippet related to the user's question if it's about programming.
It might be an example, hint, or demonstration—NOT the direct answer.

Rules:
1. Output valid JSON matching the codeBlock schema.
2. Use "codeBlock" (snippet only) and "codeLang" for the language if needed.
3. Do not include triple backticks in the "codeBlock".
`;
