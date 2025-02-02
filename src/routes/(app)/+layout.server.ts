import { api } from '@/client-api';
import { parseClientResponse } from '@/utils/api.js';

export const load = async ({ fetch }) => {
	let user = null;
	let history = null;
	try {
		user = await api({ fetch }).users.me.$get().then(parseClientResponse);
		history = user ? await api({ fetch }).tests.history.$get().then(parseClientResponse) : null;

		return { user, history };
	} catch (err) {
		console.error(err);
	}

	return { user, history };
};
