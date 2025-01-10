<script lang="ts">
	import { Check, Sparkles, PlusCircle, Loader } from 'lucide-svelte';
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

	let iconComponent = questionState.isGenerating(question)
		? Loader
		: questionState.isGenerated(question)
			? Sparkles
			: questionState.isNew(question)
				? PlusCircle
				: questionState.isSaved(question)
					? Check
					: Check;
</script>

<div class="group">
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

	<header
		class:animate-pulse={isGenerating}
		class="mb-5 mt-0.5 inline-flex w-full justify-between gap-x-7"
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
