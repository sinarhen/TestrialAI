import type {
	CodeBlockCompletion,
	Question,
	QuestionCompletion,
	TestCompletion
} from '@/types/entities';
import axios from 'axios';
import type { UpdateQuestionDto } from '../../routes/api/tests/[testId]/questions/[questionId]/+server';
import type { CreateQuestionDto } from '../../routes/api/tests/[testId]/questions/+server';
import type { CreateTestDto } from '../../routes/api/tests/+server';
import { streamOpenAiResponse, type OpenAiStreamingOptions } from '@/utils/openai-stream';
import type { QuestionModificationTool } from '@/types/openai';
import type { CreateTestSessionDto } from '../../routes/api/tests/[testId]/sessions/+server';

// returns id
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
