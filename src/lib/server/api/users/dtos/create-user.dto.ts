import { z } from 'zod';
import { userDto } from './user.dto';

export const createUserDto = userDto.omit({ id: true }).and(
	z.object({
		passwordHash: z.string().min(8)
	})
);

export type CreateUserDto = z.infer<typeof createUserDto>;
