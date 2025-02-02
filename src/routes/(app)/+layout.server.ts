import { api } from '@/client-api';
import { parseClientResponse } from '@/utils/api.js';

export const load = async ({ fetch }) => {
	// Not a right way to use the api as long as we have backend and frontend not separated
	// but for simplicity we will use it here
	const user = await api({ fetch }).users.me.$get().then(parseClientResponse);
	const history = user ? await api({ fetch }).tests.history.$get().then(parseClientResponse) : null;

	return { user, history };
};
