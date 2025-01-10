import type {
	GeneratingQuestionCompletion,
	Option,
	Question,
	QuestionCompletion,
	Survey
} from '@/types/entities';
import type { PartialBy } from '@/types/utils';

interface BaseQuestionState {
	status: Status;
}

type Status =
	| 'ready'
	| 'generating'
	| 'generated'
	| 'new'
	| 'modified'
	| 'regenerating'
	| 'regenerated';

export interface ReadyQuestion extends Question, BaseQuestionState {
	status: 'ready';
	isJustGenerated?: boolean;
}

interface GeneratingQuestion extends GeneratingQuestionCompletion, BaseQuestionState {
	status: 'generating';
}

interface NewQuestion extends QuestionCompletion, BaseQuestionState {
	status: 'new';
}

interface ModifiedQuestion extends Omit<Question, 'options'>, BaseQuestionState {
	options: PartialBy<Option, 'id'>[];
	status: 'modified';
}

interface GeneratedQuestion extends QuestionCompletion, BaseQuestionState {
	status: 'generated';
}

interface RegeneratingQuestion extends GeneratingQuestionCompletion, BaseQuestionState {
	status: 'regenerating';
	id: string;
}

interface RegeneratedQuestion extends QuestionCompletion, BaseQuestionState {
	status: 'regenerated';
	id: string;
}

export type QuestionState =
	| ReadyQuestion
	| GeneratingQuestion
	| NewQuestion
	| ModifiedQuestion
	| GeneratedQuestion
	| RegeneratingQuestion
	| RegeneratedQuestion;

export type EditableQuestion = ReadyQuestion | ModifiedQuestion | NewQuestion;
const isEditable = (question: QuestionState): question is EditableQuestion => {
	return question.status === 'ready' || question.status === 'modified' || question.status === 'new';
};

const isReady = (question: QuestionState): question is ReadyQuestion => question.status === 'ready';

const isNew = (question: QuestionState): question is NewQuestion => question.status === 'new';

const isModified = (question: QuestionState): question is ModifiedQuestion =>
	question.status === 'modified';

const isExisting = (
	question: QuestionState
): question is ReadyQuestion | RegeneratedQuestion | RegeneratingQuestion | ModifiedQuestion => {
	return (
		question.status === 'ready' ||
		question.status === 'regenerated' ||
		question.status === 'regenerating' ||
		question.status === 'modified'
	);
};

const isGenerating = (
	question: QuestionState
): question is GeneratingQuestion | RegeneratingQuestion =>
	question.status === 'generating' || question.status === 'regenerating';

const isGenerated = (
	question: QuestionState
): question is GeneratedQuestion | RegeneratedQuestion => {
	return question.status === 'generated' || question.status === 'regenerated';
};

export const questionState = {
	isReady,
	isNew,
	isModified,
	isExisting,
	isEditable,
	isGenerating,
	isGenerated
};

export type SurveyState = Omit<Survey, 'questions'> & {
	questions: QuestionState[];
};
