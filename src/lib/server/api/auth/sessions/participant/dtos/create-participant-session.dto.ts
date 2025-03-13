import { z } from 'zod';

export const createParticipantSessionDto = z.object({
	id: z.string(),
	participantId: z.string(),
	expiresAt: z.date()
});

export type CreateParticipantSessionDto = z.infer<typeof createParticipantSessionDto>;
