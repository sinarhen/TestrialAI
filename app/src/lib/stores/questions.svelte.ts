import type {Survey} from "@/types";

interface SurveyStore {
    survey: Survey | null;
    isGenerating: boolean;
}

export const currentSurveyStore = $state<SurveyStore>({
	survey: null,
    isGenerating: false
});
