import { z } from 'zod';
import { generateId } from '@api/common/utils/crypto';

export const optionDto = z.object({
	id: z.string().default(() => generateId()),
	value: z.string(),
	isCorrect: z.boolean()
});

export const publicOptionDto = optionDto.omit({ isCorrect: true });

export type OptionDto = z.infer<typeof optionDto>;
