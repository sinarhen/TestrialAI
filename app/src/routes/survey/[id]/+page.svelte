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

	onMount(() => {
		currentSurveyStore.survey = data.survey;
		currentSurveyStore.isGenerating = false;
	});
</script>

{#if currentSurveyStore.survey}
	<div class="flex gap-x-2">
		<!-- <Button class="mt-4" variant="default" size="sm" onclick={() => {}}
			>Back to the main page</Button
		> -->
		<Button variant="outline" size="sm" class="gap-x-1" onclick={() => {}}
			>Generate new <PlusCircle size="16" /></Button
		>
		<Button class="gap-x-1" variant="outline" size="sm" onclick={() => {}}
			>Delete <Trash2 size="16" /></Button
		>
	</div>
	<h2 class="motion-preset-fade mt-7 text-2xl font-bold">{currentSurveyStore.survey.title}</h2>

	<div class="mt-3 flex gap-x-4 text-sm">
		<span class="flex items-center gap-x-1"
			><CircleHelp size="12" /> {currentSurveyStore.survey.questions?.length} Questions</span
		>
		<span class="flex items-center gap-x-1"
			><Gauge size="12" /> {currentSurveyStore.survey.difficulty}</span
		>
	</div>
	<QuestionList />
{/if}
