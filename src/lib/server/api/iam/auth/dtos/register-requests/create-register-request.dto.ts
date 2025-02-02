import { z } from 'zod';

export const createRegisterRequestDto = z.object({
	email: z.string().email()
});

export type CreateRegisterRequestDto = z.infer<typeof createRegisterRequestDto>;
