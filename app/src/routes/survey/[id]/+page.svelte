<script lang="ts">
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import { CircleHelp, Gauge, PlusCircle, PlusCircleIcon, Timer, Trash2 } from 'lucide-svelte';
	import QuestionList from '../(components)/QuestionList/QuestionList.svelte';
	import { onMount } from 'svelte';
	import type { PageServerData } from './$types';
	import { Button } from '@/components/ui/button';

	const {
		data
	}: {
		data: PageServerData;
	} = $props();

	$effect(() => {
		currentSurveyStore.survey = data.survey;
		currentSurveyStore.isGenerating = false;
	});
</script>

{#if currentSurveyStore.survey}
	<div class="flex gap-x-2">
		<!-- <Button class="mt-4" variant="default" size="sm" onclick={() => {}}
			>Back to the main page</Button
		> -->
		<Button
			variant="outline"
			size="sm"
			class="-motion-translate-y-in-50 motion-opacity-in-0 motion-duration-500  gap-x-1"
			onclick={() => {}}>Generate new <PlusCircle size="16" /></Button
		>
		<Button
			class="-motion-translate-y-in-50 motion-delay-100 motion-opacity-in-0 motion-duration-500 gap-x-1"
			variant="outline"
			size="sm"
			onclick={() => {}}>Delete <Trash2 size="16" /></Button
		>
	</div>
	<h2 class="motion-opacity-in-0 motion-duration-1500 motion-delay-150 mt-7 text-2xl font-bold">
		{currentSurveyStore.survey.title}
	</h2>

	<div class="mt-3 flex gap-x-4 text-sm">
		<span class="motion-opacity-in-0 motion-delay-200 flex items-center gap-x-1"
			><CircleHelp size="12" /> {currentSurveyStore.survey.questions?.length} Questions</span
		>
		<span class="motion-delay-200 motion-opacity-in-0 flex items-center gap-x-1"
			><Gauge size="12" /> {currentSurveyStore.survey.difficulty}</span
		>
	</div>
	<QuestionList />
{/if}
