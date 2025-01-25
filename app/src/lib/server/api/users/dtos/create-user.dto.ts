import type { z } from "zod";
import { userDto } from "./user.dto";

export const createUserDto = userDto.omit({id: true})

export type CreateUserDto = z.infer<typeof createUserDto>;