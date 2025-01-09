import type { GeneratingQuestionCompletion, Question, Survey } from '@/types/entities';

export type DeepPartial<T> = T extends object
	? {
			[K in keyof T]?: DeepPartial<T[K]>;
		}
	: T;

type ReadyQuestion = Question;

type GeneratingQuestion = GeneratingQuestionCompletion & {
	isGenerating: true;
};

type QuestionState = ReadyQuestion | GeneratingQuestion;

type SurveyState = Survey & {
	questions: QuestionState[];
};

type SurveyStoreState = {
	survey: SurveyState | null;
	isGenerating: boolean;
};

export const currentSurvey = $state<SurveyStoreState>({
	survey: null,
	isGenerating: false
});
