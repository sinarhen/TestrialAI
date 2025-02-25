import { z } from 'zod';
import { userDto } from './user.dto';

export const updateEmailDto = userDto.pick({ email: true }).required();

export type UpdateEmailDto = z.infer<typeof updateEmailDto>;
