import type { z } from 'zod';
import { optionDto } from './option.dto';

export const generatedOptionDto = optionDto.omit({ id: true });

export type GeneratedOptionDto = z.infer<typeof generatedOptionDto>;
