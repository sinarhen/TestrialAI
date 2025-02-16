import type { Api } from '@/client/utils/types';
import type { InferResponseType } from 'hono';

type Me = InferResponseType<Api['users']['me']['$get']>;

class AuthContext {
	#authedUser = $state<Me | undefined>(null);
	isAuthed = $derived(!!this.#authedUser);

	get authedUser() {
		return this.#authedUser;
	}

	setAuthedUser(user: Me | undefined) {
		this.#authedUser = user;
	}
}

export const authContext = new AuthContext();
