<script lang="ts">
	import { CircleHelp, Gauge, X } from 'lucide-svelte';
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

	type SurveyGenerationState =
		| { status: 'idle' }
		| { status: 'generating'; data: GeneratingSurveyCompletion }
		| { status: 'finished'; data: SurveyCompletion };

	let abortController = $state<AbortController | null>(null);

	let generatingSurvey = $state<SurveyGenerationState>({ status: 'idle' });

	const generate = async () => {
		abortController = new AbortController();
		try {
			await streamOpenAiResponse<GeneratingSurveyCompletion, SurveyCompletion>({
				endpoint: '/api/survey/generate',
				body: {
					topic,
					difficulty,
					numberOfQuestions,
					model
				} as GenerateSurveyDto,
				signal: abortController.signal,
				onPartial: (partialData: GeneratingSurveyCompletion) => {
					generatingSurvey = {
						status: 'generating',
						data: partialData
					};
				},
				onComplete: async (finalData) => {
					generatingSurvey = {
						status: 'finished',
						data: finalData
					};
				}
			});
		} catch (e) {
			console.error(e);
			goto('/');
			toast.error('Failed to generate a survey');
		}
	};
	onMount(generate);

	const onAbort = async () => {
		abortController?.abort();
		abortController = null;
		toast.success('Survey generation is stopped');

		generatingSurvey = {
			status: 'idle'
		};
		goto('/');
	};

	const onConfirm = () => {
		if (!generatingSurvey || generatingSurvey.status !== 'finished') return;
		toast.promise(saveSurvey(generatingSurvey.data), {
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

{#if generatingSurvey.status !== 'idle'}
	<div>
		{#if generatingSurvey.status !== 'finished'}
			<Button onclick={onAbort} size="sm"><X size="16" />Stop generation</Button>
		{/if}

		<h2 class="mt-3 animate-pulse text-2xl font-bold text-opacity-50">
			{topic}
		</h2>
		<div class="mt-3 flex gap-x-4 text-sm">
			<span class="flex items-center gap-x-1"
				><CircleHelp size="12" /> {generatingSurvey.data?.questions?.length} Questions</span
			>
			<!-- <span class="flex items-center gap-x-1"><Timer size="12" /> 10 Minutes</span> -->
			<span class="flex items-center gap-x-1"
				><Gauge size="12" /> {generatingSurvey.data.difficulty}</span
			>
		</div>
		<SurveyGenerationDetails generatingSurvey={generatingSurvey.data} />
		{#if generatingSurvey.status === 'finished'}
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
