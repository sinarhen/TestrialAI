export interface Question {
	id: number;
	answerType: AnswerType;
	question: string;
	options: Option[];
}

export interface Survey {
	id: number;
	title: string;
	createdAt: Date;
	updatedAt: Date;
	questions: Question[];
}
type AnswerType = 'single' | 'multiple';

export interface Option {
	value: string;
	isCorrect: boolean;
}

