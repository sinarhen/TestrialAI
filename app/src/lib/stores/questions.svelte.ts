import { dummySurveys } from '@/utils';
import type {Survey} from "@/types";

export const currentSurveyStore = $state<Survey>(dummySurveys[1]);
