import type { Survey } from '@/types/entities';

export type DeepPartial<T> = T extends object
	? {
			[K in keyof T]?: DeepPartial<T[K]>;
		}
	: T;

type SurveyStoreState = {
	isDirty: boolean;
	survey: Survey | null;
	isGenerating: boolean;
};

export const currentSurveyStore = $state<SurveyStoreState>({
	isDirty: false,
	survey: null,
	isGenerating: false
});
