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
	| 'saved'
	| 'generating'
	| 'generated'
	| 'new'
	| 'modified'
	| 'regenerating'
	| 'regenerated';

export interface SavedQuestion extends Question, BaseQuestionState {
	status: 'saved';
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
	initialState: SavedQuestion;
}

export type QuestionState =
	| SavedQuestion
	| GeneratingQuestion
	| NewQuestion
	| ModifiedQuestion
	| GeneratedQuestion
	| RegeneratingQuestion
	| RegeneratedQuestion;

export type EditableQuestion = SavedQuestion | ModifiedQuestion | NewQuestion;
const isEditable = (question: QuestionState): question is EditableQuestion => {
	return question.status === 'saved' || question.status === 'modified' || question.status === 'new';
};

const isSaved = (question: QuestionState): question is SavedQuestion => question.status === 'saved';

const isNew = (question: QuestionState): question is NewQuestion => question.status === 'new';

const isModified = (question: QuestionState): question is ModifiedQuestion =>
	question.status === 'modified';

const isExisting = (
	question: QuestionState
): question is SavedQuestion | RegeneratedQuestion | RegeneratingQuestion | ModifiedQuestion => {
	return (
		question.status === 'saved' ||
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
	isSaved,
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
