import { z } from 'zod';

export const createLoginRequestDto = z.object({
	email: z.string().email(),
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	password: z.string().min(8)
});

export type CreateLoginRequestDto = z.infer<typeof createLoginRequestDto>;
