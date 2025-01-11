<script lang="ts">
	import { Check, CircleHelp, Gauge, Trash, X } from 'lucide-svelte';
	import SurveyGenerationDetails from './components/GeneratingSurveyDetails.svelte';
	import type { PageData } from './$types';
	import { goto, invalidate } from '$app/navigation';
	import type { GeneratingSurveyCompletion, SurveyCompletion } from '@/types/entities';
	import { streamOpenAiResponse } from '@/utils/openai-stream';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { createSurvey, streamSurveyGeneration } from '@/services/handlers';
	import { Button } from '@/components/ui/button';
	import type { GenerateSurveyDto } from '../../../api/surveys/generate/+server';

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
			await streamSurveyGeneration({
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
					toast.success('Generation is completed. Are you satisfied with the result?');
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

	const onConfirm = async () => {
		if (!generatingSurvey || generatingSurvey.status !== 'finished') return;

		toast.promise(createSurvey(generatingSurvey.data), {
			loading: 'Saving survey...',
			success: (resp) => {
				console.log(resp);
				const id = resp.data;
				goto(`/survey/${id}`);
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
	{#if generatingSurvey.status !== 'finished'}
		<Button onclick={onAbort} size="sm"><X size="16" />Stop generation</Button>
	{/if}

	<SurveyGenerationDetails generatingSurvey={generatingSurvey.data} />
	{#if generatingSurvey.status === 'finished'}
		<div class="mt-5 flex gap-x-1">
			<Button class="gap-x-1" size="sm" onclick={onConfirm}><Check size="12" />Approve</Button>
			<Button class="gap-x-1" variant="outline" size="sm" onclick={onAbort}
				><Trash size="12" /> Reject</Button
			>
		</div>
	{/if}
{:else}
	<div class="flex h-full w-full flex-col items-center justify-center">
		<p class=" text-base opacity-50">Loading...</p>
	</div>
{/if}
