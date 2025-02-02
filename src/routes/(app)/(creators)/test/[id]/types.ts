import type { PartialBy } from '@/server/api/common/utils/deep-partial';
import type { Question } from '@/server/api/db/libsql/drizzle-schema';
import type { OptionDto } from '@/server/api/questions/dtos/option/option.dto';
import type {
	GeneratedQuestionDto,
	GeneratingQuestionDto
} from '@/server/api/questions/dtos/question.dto';
import type { TestDto } from '@/server/api/tests/dtos/test.dto';
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

interface GeneratingQuestion extends GeneratingQuestionDto, BaseQuestionState {
	status: 'generating';
}

interface NewQuestion extends GeneratedQuestionDto, BaseQuestionState {
	status: 'new';
}

interface ModifiedQuestion extends Omit<Question, 'options'>, BaseQuestionState {
	options: PartialBy<OptionDto, 'id'>[];
	status: 'modified';
}

interface GeneratedQuestion extends GeneratedQuestionDto, BaseQuestionState {
	status: 'generated';
}

interface RegeneratingQuestion extends GeneratingQuestionDto, BaseQuestionState {
	status: 'regenerating';
	id: string;
}

interface RegeneratedQuestion extends GeneratedQuestionDto, BaseQuestionState {
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

export type TestState = Omit<TestDto, 'questions'> & {
	questions: QuestionState[];
};
