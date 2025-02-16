import { z } from 'zod';
import { answerDto } from './answer.dto';

export const participantAnswersDto = z.object({
	participantId: z.string(),
	answers: z.array(answerDto.extend({ submittedAt: z.date() }))
});

export type ParticipantAnswersDto = z.infer<typeof participantAnswersDto>;
