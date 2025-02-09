import { z } from 'zod';

export const loginDto = z.object({
	email: z.string().email(),
	password: z.string().min(8, 'Password must be at least 8 characters')
});

export type LoginDto = z.infer<typeof loginDto>;
