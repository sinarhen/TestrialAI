import { api } from '@/client-api';
import { parseClientResponse } from '@/utils/api.js';

export const load = async ({ fetch }) => {
	let user = null;
	let history = null;

	try {
		const userData = await api({ fetch }).users.me.$get().then(parseClientResponse);

		if (!userData) return { user, history };

		if (userData.error) {
			console.error(userData.error);
			return { user, history };
		}

		user = userData.data;

		const historyData = await api({ fetch }).tests.history.$get().then(parseClientResponse);

		if (historyData.error) {
			console.error(historyData.error);
		} else {
			history = historyData.data;
		}
	} catch (err) {
		console.error('Unexpected error:', err);
	}

	return { user, history };
};
