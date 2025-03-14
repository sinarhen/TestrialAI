<script lang="ts">
	import { Check, Sparkles, PlusCircle, Loader } from 'lucide-svelte';
	import { questionState, type QuestionState } from '../types';
	import GeneratedQuestionActions from './components/TestDetailsQuestion/GeneratedQuestionActions.svelte';
	import QuestionTitle from './components/TestDetailsQuestion/Header/QuestionTitle.svelte';
	import QuestionAnswers from './components/TestDetailsQuestion/QuestionAnswers.svelte';
	import QuestionAIEdit from './components/TestDetailsQuestion/Header/Tools/QuestionAIEdit.svelte';
	import QuestionDelete from './components/TestDetailsQuestion/Header/Tools/QuestionDelete.svelte';
	import QuestionEdit from './components/TestDetailsQuestion/Header/Tools/QuestionEdit.svelte';
	import QuestionCodeBlock from './QuestionCodeBlock.svelte';

	const {
		testId,
		question,
		updateQuestionInStore,
		deleteQuestionInStore
	}: {
		testId: string;
		question: QuestionState;
		updateQuestionInStore: (updatedQuestion: QuestionState) => void;
		deleteQuestionInStore: () => void;
	} = $props();
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

	<header class="mb-5 mt-0.5 inline-flex w-full justify-between gap-x-7">
		<div class="w-full">
			<QuestionTitle questionTitle={question.question} />
			{#if question.codeBlock && question.codeBlock.length > 0}
				<div class="mt-1">
					<QuestionCodeBlock
						isGenerating={questionState.isGenerating(question)}
						codeBlock={question.codeBlock}
						codeLanguage={question.codeLang}
					/>
				</div>
			{/if}
		</div>

		{#if questionState.isEditable(question)}
			<div class="flex h-full items-center gap-x-2">
				{#if questionState.isExisting(question)}
					<QuestionAIEdit {updateQuestionInStore} {question} {testId} />
				{/if}
				<QuestionEdit {testId} {question} {updateQuestionInStore} />
				<QuestionDelete {question} {testId} {deleteQuestionInStore} />
			</div>
		{/if}
	</header>

	<QuestionAnswers {question} />

	{#if questionState.isGenerated(question)}
		<GeneratedQuestionActions {testId} {question} {updateQuestionInStore} {deleteQuestionInStore} />
	{/if}
</div>
