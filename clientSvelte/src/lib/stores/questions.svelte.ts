import { writable } from 'svelte/store';
import type { Question } from '@/types';
import { testQuestions } from '@/utils';

export const questions = writable<Question[]>(testQuestions);
