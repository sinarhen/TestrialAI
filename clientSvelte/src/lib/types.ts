export interface Question {
	id: number;
	type: string;
	question: string;
	options: Option[];
}

export interface Option {
	value: string;
	correct: boolean;
}
