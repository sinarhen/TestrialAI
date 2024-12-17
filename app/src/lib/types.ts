export interface Question {
	id: number;
	answerType: AnswerType;
	question: string;
	options: Option[];
}

export const Difficulties = {
	EASY: 1,
	MEDIUM: 2,
	HARD: 3
} as const;

export type Difficulty = typeof Difficulties[keyof typeof Difficulties];
export interface Survey {
	id: number;
	title: string;
	difficulty: Difficulty;
	createdAt: Date;
	updatedAt: Date;
	questions: Question[];
}
type AnswerType = 'single' | 'multiple';

export interface Option {
	value: string;
	isCorrect: boolean;
}

