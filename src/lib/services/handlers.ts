import type {
	CodeBlockCompletion,
	Question,
	QuestionCompletion,
	TestCompletion
} from '@/types/entities';
import axios from 'axios';
import type { UpdateQuestionDto } from '../../routes/(app)/api/tests/[testId]/questions/[questionId]/+server';
import type { CreateQuestionDto } from '../../routes/(app)/api/tests/[testId]/questions/+server';
import type { CreateTestDto } from '../../routes/(app)/api/tests/+server';
import { streamOpenAiResponse, type OpenAiStreamingOptions } from '@/utils/openai-stream';
import type { QuestionModificationTool } from '@/types/openai';
import type { CreateTestSessionDto } from '../../routes/(app)/api/sessions/+server';

export const login = (username: string, password: string) => {
	return axios.post<string>('/api/auth/login', { username, password });
};

export const register = (username: string, password: string) => {
	return axios.post<string>('/api/auth/register', { username, password });
};

export const logout = () => axios.post<void>('/api/auth/logout');

export const createTest = (parsedTest: CreateTestDto) =>
	axios.post<string>('/api/tests', parsedTest);

export const updateQuestion = (testId: string, question: UpdateQuestionDto) =>
	axios.put<Question>(`/api/tests/${testId}/questions/${question.id}`, question);

export const deleteTest = (testId: string) => axios.delete<void>(`/api/tests/${testId}`);

export const deleteQuestion = (testId: string, questionId: string) =>
	axios.delete<void>(`/api/tests/${testId}/questions/${questionId}`);

export const createQuestion = (testId: string, question: CreateQuestionDto) =>
	axios.post<Question>(`/api/tests/${testId}/questions`, question);

export const createTestSession = (testId: string, session: CreateTestSessionDto) =>
	axios.post<string>(`/api/tests/${testId}/sessions`, session);

export const streamTestGeneration = <TFinal = TestCompletion>(
	options: OpenAiStreamHandlerOptions<TFinal>
) =>
	streamOpenAiResponse<TFinal>({
		endpoint: '/api/tests/generate',
		...options
	});

export const streamQuestionGeneration = (
	testId: string,
	options: OpenAiStreamHandlerOptions<QuestionCompletion>
) =>
	streamOpenAiResponse<QuestionCompletion>({
		endpoint: `/api/tests/${testId}/questions/generate`,
		...options
	});

export const streamQuestionModification = <TFinal = QuestionCompletion>(
	{
		testId,
		tool,
		questionId
	}: {
		testId: string;
		questionId: string;
		tool: QuestionModificationTool;
	},
	options: OpenAiStreamHandlerOptions<TFinal>
) =>
	streamOpenAiResponse<TFinal>({
		endpoint: `/api/tests/${testId}/questions/${questionId}/${tool}`,
		...options
	});

export const streamCodeBlockGeneration = <TFinal = CodeBlockCompletion>(
	testId: string,
	questionId: string,
	options: OpenAiStreamHandlerOptions<TFinal>
) =>
	streamOpenAiResponse<TFinal>({
		endpoint: `/api/tests/${testId}/questions/${questionId}/code-block`,
		...options
	});

type OpenAiStreamHandlerOptions<TFinal> = Omit<OpenAiStreamingOptions<TFinal>, 'endpoint'>;
