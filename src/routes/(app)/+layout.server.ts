import { api } from '@/client-api';
import { parseClientResponse } from '@/utils/api.js';

export const load = async ({ fetch }) => {
	// Not a right way to use the api as long as we have backend and frontend not separated
	// but for simplicity we will use it here
	return { user: await api({ fetch }).users.me.$get().then(parseClientResponse) };
};
