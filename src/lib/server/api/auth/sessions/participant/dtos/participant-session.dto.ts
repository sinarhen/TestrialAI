import { z } from 'zod';

export const participantSessionDto = z.object({
	id: z.string(),
	participantId: z.string(),
	expiresAt: z.date()
});

export type ParticipantSessionDto = z.infer<typeof participantSessionDto>;
