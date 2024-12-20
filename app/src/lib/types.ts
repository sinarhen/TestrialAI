export interface Survey {
	id: string;
	title: string;
	description: string;
	difficulty: Difficulty;
	createdAt: Date;
	updatedAt: Date;
	questions: Question[];
}
export type SurveySchema = Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>;

export interface Question {
	id: string;
	answerType: AnswerType;
	correctAnswer?: string; // Only for text-based answers
	question: string;
	options: Option[];
}

export const Difficulties ={
	EASY: 'Easy',
	MEDIUM: 'Medium',
	HARD: 'Hard'
} as const

export type Difficulty = typeof Difficulties[keyof typeof Difficulties];

export type AnswerType = 'single' | 'multiple' | 'text';

export interface Option {
	value: string;
	isCorrect: boolean;
}

