import type { InferRequestType } from 'hono';
import { TanstackRequestOptions } from '../request-options';
import type { Api, ApiMutation } from '@/utils/types';
import { parseClientResponse } from '@/utils/api';

export type CreateQuestionRequest = Api['questions'][':testId']['questions']['$post'];
export type GenerateQuestionRequest = Api['questions'][':testId']['questions']['generate']['$post'];
export type UpdateQuestionRequest =
	Api['questions'][':testId']['questions'][':questionId']['$post'];
export type RegenerateQuestionWithToolRequest =
	Api['questions'][':testId']['questions'][':questionId'][':tool']['$post'];
export type GenerateQuestionCodeBlockRequest =
	Api['questions'][':testId']['questions'][':questionId']['generate-code-block']['$post'];

export class QuestionsModule extends TanstackRequestOptions {
	namespace = 'questions';

	createQuestion(): ApiMutation<CreateQuestionRequest> {
		return {
			mutationFn: async (args: InferRequestType<CreateQuestionRequest>) =>
				await this.api.questions[':testId'].questions.$post(args).then(parseClientResponse)
		};
	}

	generateQuestion(): ApiMutation<GenerateQuestionRequest> {
		return {
			mutationFn: async (args: InferRequestType<GenerateQuestionRequest>) =>
				await this.api.questions[':testId'].questions.generate.$post(args).then(parseClientResponse)
		};
	}

	updateQuestion(): ApiMutation<UpdateQuestionRequest> {
		return {
			mutationFn: async (args: InferRequestType<UpdateQuestionRequest>) =>
				await this.api.questions[':testId'].questions[':questionId']
					.$post(args)
					.then(parseClientResponse)
		};
	}

	regenerateQuestionWithTool(): ApiMutation<RegenerateQuestionWithToolRequest> {
		return {
			mutationFn: async (args: InferRequestType<RegenerateQuestionWithToolRequest>) =>
				await this.api.questions[':testId'].questions[':questionId'][':tool']
					.$post(args)
					.then(parseClientResponse)
		};
	}

	generateCodeBlock(): ApiMutation<GenerateQuestionCodeBlockRequest> {
		return {
			mutationFn: async (args: InferRequestType<GenerateQuestionCodeBlockRequest>) =>
				await this.api.questions[':testId'].questions[':questionId']['generate-code-block']
					.$post(args)
					.then(parseClientResponse)
		};
	}
}
