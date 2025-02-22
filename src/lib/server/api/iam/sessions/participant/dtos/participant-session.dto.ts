import { z } from 'zod';

export const participantSessionDto = z.object({
	id: z.string(),
	anonymousUserId: z.string(),
	expiresAt: z.date()
});

export type ParticipantSessionDto = z.infer<typeof participantSessionDto>;
