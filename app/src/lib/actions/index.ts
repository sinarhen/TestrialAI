import type { Survey, SurveySchemaType } from '@/types/entities';
import axios from 'axios';
import type { POST } from '../../routes/(api)/save-survey/+server';
import type { RequestHandler } from '../../routes/(actions)/save-survey/$types';

export const saveSurvey = (parsedSurvey: SurveySchemaType) =>
	axios.post<Survey>('/save-survey', parsedSurvey);

export const updateSurvey = (survey: Survey) => axios.post<string>('/update-survey', survey);
