import { z } from 'zod';
import type { DeepPartial } from './utils';

export interface Survey {
	id: string;
	title: string;
	description?: string;
	difficulty: Difficulty;
	createdAt?: Date;
	updatedAt?: Date;
	questions: Question[];
}

export interface Question {
	id: string;
	answerType: AnswerType;
	correctAnswer: string | null;
	question: string;
	options: Option[];
}

export const Difficulties = {
	EASY: 'Easy',
	MEDIUM: 'Medium',
	HARD: 'Hard'
} as const;

export type Difficulty = (typeof Difficulties)[keyof typeof Difficulties];

export const AnswerTypes = {
	SINGLE: 'single',
	MULTIPLE: 'multiple',
	TEXT: 'text'
} as const;
export type AnswerType = (typeof AnswerTypes)[keyof typeof AnswerTypes];

export interface Option {
	id: string;
	value: string;
	isCorrect: boolean;
}

export const optionSchema = z.object({
	value: z.string(),
	isCorrect: z.boolean()
});

export const questionSchema = z
	.object({
		answerType: z.enum(['single', 'multiple', 'text']),
		correctAnswer: z.string().nullable(),
		question: z.string(),
		options: z.array(optionSchema).nullable()
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

export const surveySchema = z.object({
	title: z.string(),
	description: z.string(),
	difficulty: z.enum(['Easy', 'Medium', 'Hard']),
	questions: z.array(questionSchema)
});

export type QuestionCompletion = z.infer<typeof questionSchema>;
export type SurveyCompletion = z.infer<typeof surveySchema>;

export type GeneratingQuestionCompletion = DeepPartial<QuestionCompletion>;
export type GeneratingSurveyCompletion = DeepPartial<SurveyCompletion>;
