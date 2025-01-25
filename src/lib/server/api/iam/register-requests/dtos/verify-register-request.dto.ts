import { z } from 'zod';

export const verifyRegisterRequestDto = z.object({
	email: z.string().email(),
	firstName: z.string().optional().or(z.string().min(2)),
	lastName: z.string().optional().or(z.string().min(2)),
	password: z.string().min(8),
	verificationCode: z.string().min(6)
});

export type VerifyRegisterRequestDto = z.infer<typeof verifyRegisterRequestDto>;
