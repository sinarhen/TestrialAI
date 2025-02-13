import { z } from 'zod';
import { publicQuestionDto, questionDto } from '@api/questions/dtos/question.dto';
import type { TestWithRelations } from '../tables';

export const testDto = z.object({
	id: z.string(),
	title: z.string(),
	description: z.string().nullable(),
	questions: z.array(questionDto)
});

export const publicTestDto = testDto.omit({ questions: true }).extend({
	questions: z.array(publicQuestionDto)
});

export function mapTestToPublic(test: TestWithRelations): PublicTestDto {
	return {
		id: test.id,
		title: test.title,
		description: test.description,
		questions: test.questions.map((q) => ({
			id: q.id,
			answerType: q.answerType, // TODO: Add an option to not expose answerType to the test taker
			question: q.question,
			codeBlock: q.codeBlock,
			codeLang: q.codeLang,
			options:
				q.options?.map((o) => ({
					id: o.id,
					value: o.value
				})) ?? []
		}))
	};
}

export type PublicTestDto = z.infer<typeof publicTestDto>;
export type TestDto = z.infer<typeof testDto>;
