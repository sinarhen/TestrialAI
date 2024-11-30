export interface Question {
	id: number;
	answerType: AnswerType;
	question: string;
	options: Option[];
}

type AnswerType = 'single' | 'multiple';

export interface Option {
	value: string;
	correct: boolean;
}
