<script lang="ts">
	import { browser } from '$app/environment';
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import { CircleHelp, Gauge, Timer } from 'lucide-svelte';
	import QuestionList from '../(components)/QuestionList/QuestionList.svelte';
	import { onMount } from 'svelte';
	import { Button } from '@/components/ui/button';

	let titlePlaceholder = browser
		? (new URLSearchParams(location.search).get('topic') ?? 'Generating a Survey')
		: 'Generating a Survey';
</script>

{#if currentSurveyStore.survey}
	<div>
		{#if currentSurveyStore.survey.title}
			<h2 class="motion-preset-typewrite text-2xl font-bold">{currentSurveyStore.survey.title}</h2>
		{:else}
			<h2 class="motion-preset-typewriter animate-pulse text-2xl font-bold text-opacity-50">
				{titlePlaceholder}
			</h2>
		{/if}
		<div class="mt-3 flex gap-x-4 text-sm">
			<span class="flex items-center gap-x-1"
				><CircleHelp size="12" /> {currentSurveyStore.survey.questions?.length} Questions</span
			>
			<!-- <span class="flex items-center gap-x-1"><Timer size="12" /> 10 Minutes</span> -->
			<span class="flex items-center gap-x-1"
				><Gauge size="12" /> {currentSurveyStore.survey.difficulty}</span
			>
		</div>
		<QuestionList />
	</div>
{:else}
	<div class="flex h-full w-full items-center justify-center">
		<p class="text-base font-semibold opacity-50">Loading...</p>
	</div>
{/if}
