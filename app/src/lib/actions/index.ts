import type { Question, Survey, SurveyCompletion } from '@/types/entities';
import axios from 'axios';
import type { UpdateQuestionDto } from '../../routes/api/surveys/[surveyId]/questions/[questionId]/+server';
import type { CreateQuestionDto } from '../../routes/api/surveys/[surveyId]/questions/+server';

export const createSurvey = (parsedSurvey: SurveyCompletion) =>
	axios.post<Survey>('/api/surveys', parsedSurvey);

export const updateQuestion = ({
	surveyId,
	question
}: {
	surveyId: string;
	question: UpdateQuestionDto;
}) => axios.post<string>(`/api/surveys/${surveyId}/questions/${question.id}`, question);

export const deleteSurvey = (surveyId: string) => axios.delete<void>(`/api/surveys/${surveyId}`);

export const deleteQuestion = (surveyId: string, questionId: string) =>
	axios.delete<void>(`/api/surveys/${surveyId}/questions/${questionId}`);

export const createQuestion = (surveyId: string, question: CreateQuestionDto) =>
	axios.post<Question>(`/api/surveys/${surveyId}/questions`, question);
