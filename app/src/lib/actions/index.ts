import type { Survey, SurveyCompletion } from '@/types/entities';
import axios from 'axios';

export const saveSurvey = (parsedSurvey: SurveyCompletion) =>
	axios.post<Survey>('/save-survey', parsedSurvey);

export const updateSurvey = (survey: Survey) => axios.post<string>('/update-survey', survey);
