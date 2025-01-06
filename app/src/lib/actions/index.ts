import type { Survey, SurveyCompletion } from '@/types/entities';
import axios from 'axios';

export const saveSurvey = (parsedSurvey: SurveyCompletion) =>
	axios.post<Survey>('/api/survey/save', parsedSurvey);

export const updateSurvey = (survey: Survey) => axios.post<string>('/api/survey/update', survey);

export const deleteSurvey = (surveyId: string) =>
	axios.delete<void>(`/api/survey/${surveyId}/delete`);
