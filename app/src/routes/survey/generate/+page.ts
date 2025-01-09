import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ url }) => {
	const params = url.searchParams;

	const topic = params.get('topic');
	const numberOfQuestions = parseInt(params.get('numberOfQuestions') || '0', 10);
	const difficulty = params.get('difficulty');
	const model = params.get('model');

	if (!topic || !numberOfQuestions || !difficulty || !model) {
		error(400, 'Missing required parameters');
	}

	return {
		generationParams: {
			topic,
			numberOfQuestions,
			difficulty,
			model
		}
	};
};
