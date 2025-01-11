<script lang="ts">
	import { Check, Sparkles, PlusCircle, Loader } from 'lucide-svelte';
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
		updateQuestionInStore: (updatedQuestion: QuestionState) => void;
		deleteQuestionInStore: () => void;
	} = $props();

	const isJustGenerated = $derived(
		questionState.isSaved(question) ? question.isJustGenerated : false
	);
</script>

<div class="group" class:motion-preset-confetti={isJustGenerated}>
	{#key question.status}
		<span class="motion-preset-focus inline-flex items-center gap-x-1 text-xs opacity-50">
			<div>
				{#if questionState.isGenerating(question)}
					<Loader class="motion-preset-spin" size="12" />
				{:else if questionState.isGenerated(question)}
					<Sparkles size="12" />
				{:else if questionState.isNew(question)}
					<PlusCircle size="12" />
				{:else if questionState.isSaved(question)}
					<Check size="12" />
				{:else}
					<Check size="12" />
				{/if}
			</div>

			{question.status.charAt(0).toUpperCase() + question.status.slice(1)}
		</span>
	{/key}

	<header class="mb-5 mt-0.5 inline-flex w-full justify-between gap-x-7">
		<QuestionTitle questionTitle={question.question} />

		{#if questionState.isEditable(question)}
			<div class="flex h-full items-center gap-x-2">
				{#if questionState.isExisting(question)}
					<QuestionAIEdit {updateQuestionInStore} {question} {surveyId} />
				{/if}
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
