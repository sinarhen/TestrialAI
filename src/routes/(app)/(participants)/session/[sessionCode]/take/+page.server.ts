import { api } from '@/client/api';
import { parseClientResponse } from '@/client/utils/api';
import { ParticipantSessionsService } from '@/server/api/auth/sessions/participant/participant-sessions.service';
import { error } from '@sveltejs/kit';
import { container } from 'tsyringe';
export async function load({ params, cookies, fetch }) {
	const { sessionCode } = params;

	// TODO: bad practice to combine sveltekit and server api here. (should be in a controller)
	// Maybe create an sveltekit handler that can be used in sveltekit routes?
	// const resp = await container
	// 	.resolve(TestSessionsService)
	// 	.getTestSessionPublicData(testSessionToken);

	const participantSessionId = cookies.get(
		container.resolve(ParticipantSessionsService).sessionCookieName
	);

	const resp = await api({ fetch })
		['test-sessions'][':testSessionCode'].test.$get(
			{
				param: { testSessionCode: sessionCode }
			},
			{
				headers: {
					Cookie: `${container.resolve(ParticipantSessionsService).sessionCookieName}=${participantSessionId}`
				}
			}
		)
		.then(parseClientResponse);

	if (!resp.data || resp.error) {
		console.error(resp.error);
		return error(404);
	}

	return { testSession: resp.data };
}
