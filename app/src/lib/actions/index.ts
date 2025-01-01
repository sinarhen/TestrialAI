import type { SurveySchemaType } from '@/types/entities';

export const saveSurvey = (parsedSurvey: SurveySchemaType) =>
	fetch('/save', {
		method: 'POST',
		body: JSON.stringify(parsedSurvey),
		headers: {
			'Content-Type': 'application/json'
		}
	});
