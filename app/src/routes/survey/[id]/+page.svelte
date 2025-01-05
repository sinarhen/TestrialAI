<script lang="ts">
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import { CircleHelp, Gauge, Timer } from 'lucide-svelte';
	import QuestionList from '../(components)/QuestionList/QuestionList.svelte';
	import { onMount } from 'svelte';
	import type { PageServerData } from './$types';

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
	<h2 class="motion-preset-typewriter text-2xl font-bold">{currentSurveyStore.survey.title}</h2>

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
