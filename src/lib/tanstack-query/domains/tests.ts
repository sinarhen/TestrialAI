import type { InferRequestType } from 'hono';
import { RequestOptions } from '../request-options';
import type { Api, ApiMutation, ApiQuery } from '@/utils/types';
import { parseClientResponse } from '@/utils/api';

export type CreateTestRequest = Api['tests']['$post'];
export type GenerateTestRequest = Api['tests']['generate']['$post'];
export type DeleteTestRequest = Api['tests'][':testId']['$delete'];
export type ExportTestPdfRequest = Api['tests'][':testId']['pdf']['$get'];
export type GetTestsHistoryRequest = Api['tests']['history']['$get'];

export class TestsModule extends RequestOptions {
	namespace = 'tests';

	createTest() {
		return {
			mutationFn: async (args: InferRequestType<CreateTestRequest>) =>
				await this.api.tests.$post(args).then(parseClientResponse)
		};
	}

	getTestsHistory(): ApiQuery<GetTestsHistoryRequest> {
		return {
			queryKey: [this.namespace, 'history'],
			queryFn: async () => await this.api.tests.history.$get().then(parseClientResponse)
		};
	}

	generateTest(): ApiMutation<GenerateTestRequest> {
		return {
			mutationFn: async (args: InferRequestType<GenerateTestRequest>) =>
				await this.api.tests.generate.$post(args)
		};
	}

	getGenerateTestUrl(): string {
		return this.api.tests.generate.$url().pathname;
	}

	deleteTest(): ApiMutation<DeleteTestRequest> {
		return {
			mutationFn: async (args: InferRequestType<DeleteTestRequest>) =>
				await this.api.tests[':testId'].$delete(args).then(parseClientResponse)
		};
	}

	exportPdf(testId: string, testUpdatedAt: Date): ApiQuery<ExportTestPdfRequest> {
		return {
			queryKey: [this.namespace, 'pdf', testUpdatedAt.toString()],
			queryFn: async () =>
				await this.api.tests[':testId'].pdf.$get({ param: { testId } }).then(parseClientResponse)
		};
	}
}
