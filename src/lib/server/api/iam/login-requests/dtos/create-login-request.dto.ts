import { z } from 'zod';

export const createLoginRequestDto = z.object({
	email: z.string().email(),
	password: z.string().min(8)
});

export type CreateLoginRequestDto = z.infer<typeof createLoginRequestDto>;
