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
	id?: string;
	answerType: AnswerType;
	correctAnswer: string | null; // Only for text-based answers
	question: string;
	options: Option[];
}

export const Difficulties ={
	EASY: 'Easy',
	MEDIUM: 'Medium',
	HARD: 'Hard'
} as const

export type Difficulty = typeof Difficulties[keyof typeof Difficulties];


export const AnswerTypes = {
	SINGLE: 'single',
	MULTIPLE: 'multiple',
	TEXT: 'text'
}
export type AnswerType = typeof AnswerTypes[keyof typeof AnswerTypes];

export interface Option {
	id?: string;
	value: string;
	isCorrect: boolean;
}

