<script lang="ts">
	import { CircleHelp, Gauge } from 'lucide-svelte';
	import SurveyGenerationDetails from './(components)/GeneratingSurveyDetails.svelte';
	import type { PageData } from './$types';
	import { goto, invalidateAll } from '$app/navigation';
	import type { GeneratingSurveyCompletion, SurveyCompletion } from '@/types/entities';
	import { streamOpenAiResponse } from '@/utils/openai-stream';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { saveSurvey } from '@/actions';
	import { Button } from '@/components/ui/button';
	import type { GenerateSurveyDto } from '../../api/survey/generate/+server';

	const { data }: { data: PageData } = $props();
	const { topic, numberOfQuestions, difficulty, model } = data.generationParams;

	let generatingSurvey = $state<
		| null
		| {
				isFinishedGenerating: false;
				survey: GeneratingSurveyCompletion;
		  }
		| {
				isFinishedGenerating: true;
				survey: SurveyCompletion;
		  }
	>(null);

	onMount(async () => {
		await streamOpenAiResponse<GeneratingSurveyCompletion, SurveyCompletion>({
			endpoint: '/api/survey/generate',
			body: {
				topic,
				difficulty,
				numberOfQuestions,
				model
			} as GenerateSurveyDto,
			onPartial: ({ partialData }) => {
				generatingSurvey = {
					isFinishedGenerating: false,
					survey: partialData
				};
			},
			onComplete: async ({ finalData, runner }) => {
				generatingSurvey = {
					isFinishedGenerating: true,
					survey: finalData
				};
			},
			onError: (err) => {
				console.error(err);
				goto('/');
				toast.error('Failed to generate-question survey');
			}
		});
	});

	const onAbort = () => {
		generatingSurvey = null;
		goto('/');
	};

	const onConfirm = () => {
		if (!generatingSurvey || !generatingSurvey.isFinishedGenerating) return;
		toast.promise(saveSurvey(generatingSurvey.survey), {
			loading: 'Saving survey...',
			success: ({ data }) => {
				goto(`/survey/${data.id}`);
				invalidateAll();
				return 'Survey is generated and saved successfully';
			},
			error: (err) => {
				console.error(err);
				return 'Survey is failed to save';
			}
		});
	};
</script>

{#if generatingSurvey}
	<div>
		<h2 class="motion-preset-typewriter animate-pulse text-2xl font-bold text-opacity-50">
			{topic}
		</h2>
		<div class="mt-3 flex gap-x-4 text-sm">
			<span class="flex items-center gap-x-1"
				><CircleHelp size="12" /> {generatingSurvey.survey.questions?.length} Questions</span
			>
			<!-- <span class="flex items-center gap-x-1"><Timer size="12" /> 10 Minutes</span> -->
			<span class="flex items-center gap-x-1"
				><Gauge size="12" /> {generatingSurvey.survey.difficulty}</span
			>
		</div>
		<SurveyGenerationDetails generatingSurvey={generatingSurvey.survey} />
		{#if generatingSurvey.isFinishedGenerating}
			<div class="mt-4 flex gap-x-1">
				<Button variant="outline" size="sm" onclick={onConfirm}>Confirm</Button>
				<Button variant="outline" size="sm" onclick={onAbort}>Abort</Button>
			</div>
		{/if}
	</div>
{:else}
	<div class="flex h-full w-full flex-col items-center justify-center">
		<p class=" text-base opacity-50">Loading...</p>
	</div>
{/if}
