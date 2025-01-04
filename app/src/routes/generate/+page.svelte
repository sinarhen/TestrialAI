<script lang="ts">
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import { CircleHelp, Gauge, Timer } from 'lucide-svelte';
	import QuestionList from './components/QuestionList/QuestionList.svelte';
</script>

{#if currentSurveyStore.survey}
	<h2 class="text-2xl font-bold">{currentSurveyStore.survey.title}</h2>
	<div class="mt-1 flex gap-x-4 text-sm">
		<span class="flex items-center gap-x-1"
			><CircleHelp size="12" /> {currentSurveyStore.survey.questions?.length} Questions</span
		>
		<!-- <span class="flex items-center gap-x-1"><Timer size="12" /> 10 Minutes</span> -->
		<span class="flex items-center gap-x-1"
			><Gauge size="12" /> {currentSurveyStore.survey.difficulty}</span
		>
	</div>
	<div class="relative mt-6 flex h-full w-full flex-col gap-x-12 xl:flex-row">
		<QuestionList />
	</div>
{/if}
