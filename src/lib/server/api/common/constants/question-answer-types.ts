export const AnswerTypes = {
	SINGLE: 'single',
	MULTIPLE: 'multiple',
	TEXT: 'text'
} as const;
export type AnswerType = (typeof AnswerTypes)[keyof typeof AnswerTypes];
