import { z } from "zod";

export interface Survey {
	id: string;
	title: string;
	description: string;
	difficulty: Difficulty;
	createdAt: Date;
	updatedAt: Date;
	questions?: Question[];
}

export interface Question {
	id: string;
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
	id: string;
	value: string;
	isCorrect: boolean;
}



export const optionSchema = z.object({
    value: z.string(),
    isCorrect: z.boolean(),
  });
  
  export const questionSchema = z.object({
    answerType: z.enum(["single", "multiple", "text"]),
    correctAnswer: z.string().nullable(),
    question: z.string(),
    options: z.array(optionSchema),
  });
  
  export const surveySchema = z.object({
    title: z.string(),
    description: z.string(),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    questions: z.array(questionSchema),
  });
  
  export const generateSurveyParamsSchema = z.object({
    topic: z.string().min(1),
    difficulty: z.enum(["Easy", "Medium", "Hard"]),
    numberOfQuestions: z.number().int().min(1),
  });
  
export type GenerateSurveyParams = z.infer<typeof generateSurveyParamsSchema>;
export type SurveySchemaType = z.infer<typeof surveySchema>;

export const Models = {
	"4o-mini": "gpt-4o-mini",
	"4o": "gpt-4o",
	// "o1-preview": "gpt-o1-preview"
} as const;
export type Model = typeof Models[keyof typeof Models];