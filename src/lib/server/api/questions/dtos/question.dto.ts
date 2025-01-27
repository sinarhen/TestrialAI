import { z } from 'zod';
import { optionDto } from './option/option.dto';
import type { DeepPartial } from '@api/common/utils/deep-partial';
import { supportedLangs } from '@api/common/constants/supported-codeblock-langs';

export const questionDto = z
	.object({
		answerType: z.enum(['single', 'multiple', 'text']),
		correctAnswer: z.string().nullable(),
		question: z.string(),
		codeBlock: z.string().optional(),
		codeLang: z.enum(supportedLangs).optional(),
		options: z.array(optionDto),
		answerExplanation: z.string().nullable()
	})
	.refine(
		(data) => {
			if (data.answerType === 'text') {
				return data.correctAnswer !== null;
			}
			return true;
		},
		{
			message: 'correctAnswer must be null for text questions, and non-empty for other types',
			path: ['correctAnswer'] // Point the error to the `correctAnswer` field
		}
	);
export type QuestionDto = z.infer<typeof questionDto>;
export type GeneratingQuestionDto = DeepPartial<QuestionDto>;
