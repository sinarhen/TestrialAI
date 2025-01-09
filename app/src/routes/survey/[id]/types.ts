import type {
	GeneratingQuestionCompletion,
	Option,
	Question,
	QuestionCompletion,
	Survey
} from '@/types/entities';
import type { PartialBy } from '@/types/utils';

type ReadyQuestion = Question & {
	status: 'ready';
};

type GeneratingQuestion = GeneratingQuestionCompletion & {
	status: 'generating';
};

type GeneratedQuestion = QuestionCompletion & {
	status: 'generated';
};

type NewQuestion = QuestionCompletion & {
	status: 'new';
};

type ModifiedQuestion = Omit<Question, 'options'> & {
	options: PartialBy<Option, 'id'>[];
	status: 'modified';
};

export type QuestionState =
	| ReadyQuestion
	| GeneratingQuestion
	| NewQuestion
	| ModifiedQuestion
	| GeneratedQuestion;

export type SurveyState = Omit<Survey, 'questions'> & {
	questions: QuestionState[];
};

// export type SurveyStoreState = {
// 	survey: SurveyState | null;
// };
