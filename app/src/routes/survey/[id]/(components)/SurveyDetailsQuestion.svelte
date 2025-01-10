<script lang="ts">
	import { Sparkles } from 'lucide-svelte';
	import { type Question } from '@/types/entities';
	import { questionState, type QuestionState } from '../types';
	import GeneratedQuestionActions from './(components)/SurveyDetailsQuestion/GeneratedQuestionActions.svelte';
	import QuestionTitle from './(components)/SurveyDetailsQuestion/Header/QuestionTitle.svelte';
	import QuestionAnswers from './(components)/SurveyDetailsQuestion/QuestionAnswers.svelte';
	import QuestionAIEdit from './(components)/SurveyDetailsQuestion/Header/Tools/QuestionAIEdit.svelte';
	import QuestionDelete from './(components)/SurveyDetailsQuestion/Header/Tools/QuestionDelete.svelte';
	import QuestionEdit from './(components)/SurveyDetailsQuestion/Header/Tools/QuestionEdit.svelte';

	const {
		surveyId,
		question,
		updateQuestionInStore,
		deleteQuestionInStore
	}: {
		surveyId: string;
		question: QuestionState;
		updateQuestionInStore: (updatedQuestion: Question, isJustGenerated?: boolean) => void;
		deleteQuestionInStore: () => void;
	} = $props();

	const isGenerating = $derived(questionState.isGenerating(question));
	const isGenerated = $derived(questionState.isGenerated(question));
</script>

<div class="group">
	{#if isGenerated}
		<span
			class="motion-preset-shrink motion-opacity-in-0 motion-delay-150 inline-flex items-center gap-x-0.5 rounded-md border bg-black p-1 text-xs text-white"
		>
			<Sparkles size="12" /> Finished
		</span>
	{/if}
	{#if isGenerating}
		<span
			class="motion-preset-shrink motion-opacity-in-0 motion-delay-150 inline-flex items-center gap-x-0.5 rounded-md border bg-black p-1 text-xs text-white"
		>
			<Sparkles size="12" /> Generating
		</span>
	{/if}
	<header
		class:animate-pulse={isGenerating}
		class="mb-5 inline-flex w-full justify-between gap-x-4"
	>
		<QuestionTitle questionTitle={question.question} />

		{#if questionState.isEditable(question)}
			<div class="flex h-full items-center gap-x-2">
				<QuestionAIEdit />
				<QuestionEdit {surveyId} {question} {updateQuestionInStore} />
				<QuestionDelete {question} {surveyId} {deleteQuestionInStore} />
			</div>
		{/if}
	</header>

	<QuestionAnswers {question} />

	{#if questionState.isGenerated(question)}
		<GeneratedQuestionActions
			{surveyId}
			{question}
			{updateQuestionInStore}
			{deleteQuestionInStore}
		/>
	{/if}
</div>
