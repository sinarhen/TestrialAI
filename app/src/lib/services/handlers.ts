import type {
	GeneratingQuestionCompletion,
	GeneratingSurveyCompletion,
	Question,
	QuestionCompletion,
	Survey,
	SurveyCompletion
} from '@/types/entities';
import axios from 'axios';
import type { UpdateQuestionDto } from '../../routes/api/surveys/[surveyId]/questions/[questionId]/+server';
import type { CreateQuestionDto } from '../../routes/api/surveys/[surveyId]/questions/+server';
import type { CreateSurveyDto } from '../../routes/api/surveys/+server';
import { streamOpenAiResponse, type OpenAiStreamingOptions } from '@/utils/openai-stream';
import type { QuestionModificationTool } from '@/types/openai';

// returns id
export const createSurvey = (parsedSurvey: CreateSurveyDto) =>
	axios.post<string>('/api/surveys', parsedSurvey);

export const updateQuestion = (surveyId: string, question: UpdateQuestionDto) =>
	axios.put<Question>(`/api/surveys/${surveyId}/questions/${question.id}`, question);

export const deleteSurvey = (surveyId: string) => axios.delete<void>(`/api/surveys/${surveyId}`);

export const deleteQuestion = (surveyId: string, questionId: string) =>
	axios.delete<void>(`/api/surveys/${surveyId}/questions/${questionId}`);

export const createQuestion = (surveyId: string, question: CreateQuestionDto) =>
	axios.post<Question>(`/api/surveys/${surveyId}/questions`, question);

export const streamSurveyGeneration = <
	TPartial = GeneratingSurveyCompletion,
	TFinal = SurveyCompletion
>(
	options: OpenAiStreamHandlerOptions<TPartial, TFinal>
) =>
	streamOpenAiResponse<TPartial, TFinal>({
		endpoint: '/api/surveys/generate',
		...options
	});

export const streamQuestionGeneration = <
	TPartial = GeneratingQuestionCompletion,
	TFinal = QuestionCompletion
>(
	surveyId: string,
	options: OpenAiStreamHandlerOptions<TPartial, TFinal>
) =>
	streamOpenAiResponse<TPartial, TFinal>({
		endpoint: `/api/surveys/${surveyId}/questions/generate`,
		...options
	});

export const streamQuestionModification = <
	TPartial = GeneratingQuestionCompletion,
	TFinal = QuestionCompletion
>(
	{
		surveyId,
		tool,
		questionId
	}: {
		surveyId: string;
		questionId: string;
		tool: QuestionModificationTool;
	},
	options: OpenAiStreamHandlerOptions<TPartial, TFinal>
) =>
	streamOpenAiResponse<TPartial, TFinal>({
		endpoint: `/api/surveys/${surveyId}/questions/${questionId}/${tool}`,
		...options
	});

type OpenAiStreamHandlerOptions<TPartial, TFinal> = Omit<
	OpenAiStreamingOptions<TPartial, TFinal>,
	'endpoint'
>;
