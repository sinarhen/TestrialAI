import { z } from 'zod';
import type { DeepPartial } from './utils';

export interface Test {
	id: string;
	title: string;
	description?: string;
	createdAt?: Date;
	updatedAt?: Date;
	questions: Question[];
}

export interface Question {
	id: string;
	answerType: AnswerType;
	codeBlock?: string | null;
	codeLang?: SupportedLanguage | null;
	correctAnswer: string | null;
	answerExplanation?: string | null;
	question: string;
	options: Option[];
}
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

export const supportedLangs = [
	'typescript',
	'javascript',
	'python',
	'bash',
	'yaml',
	'json',
	'xml',
	'css',
	'csharp',
	'c',
	'cpp',
	'plaintext',
	'java',
	'go',
	'rust',
	'ruby',
	'php',
	'sql',
	'perl'
] as const;
export type SupportedLanguage = (typeof supportedLangs)[number];

export const optionSchema = z.object({
	value: z.string(),
	isCorrect: z.boolean()
});

export const displayModes = ['cards', 'list'] as const;
export type DisplayMode = (typeof displayModes)[number];

export type TestSession = {
	id: string;
	slug: string;
	testId: string;
	startTime: Date;
	endTime: Date | null;
	durationInMinutes: number;
	testStateJson: Test;
	displayMode: DisplayMode;
	participants: TestSessionParticipant[];
};

export type TestSessionParticipant = {
	id: string;
	testSessionId: string;
	userId: string | null;
	status: TestSessionParticipantStatus;
	score: number;
	feedback?: string;
};
export const testSessionParticipantStatuses = ['joined', 'active', 'completed', 'aborted'] as const;
export type TestSessionParticipantStatus = (typeof testSessionParticipantStatuses)[number];

export const questionSchema = z
	.object({
		answerType: z.enum(['single', 'multiple', 'text']),
		correctAnswer: z.string().nullable(),
		question: z.string(),
		codeBlock: z.string().optional(),
		codeLang: z.enum(supportedLangs).optional(),
		options: z.array(optionSchema),
		answerExplanation: z.string().nullable()
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

export const testSchema = z.object({
	title: z.string(),
	description: z.string(),
	questions: z.array(questionSchema)
});

export const codeBlockCompletionSchema = z.object({
	codeBlock: z.string(),
	codeLang: z.enum(supportedLangs)
});
export type CodeBlockCompletion = z.infer<typeof codeBlockCompletionSchema>;
export type QuestionCompletion = z.infer<typeof questionSchema>;
export type TestCompletion = z.infer<typeof testSchema>;

export type GeneratingQuestionCompletion = DeepPartial<QuestionCompletion>;
export type GeneratingTestCompletion = DeepPartial<TestCompletion>;
