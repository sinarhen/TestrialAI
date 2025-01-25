import type { z } from 'zod';
import { userDto } from './user.dto';

export const updateUserDto = userDto
	.pick({
		firstName: true,
		lastName: true,
	});

export type UpdateUserDto = z.infer<typeof updateUserDto>;
