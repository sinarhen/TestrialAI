<script lang="ts">
	import { Check, CircleHelp, Gauge, Trash, X } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import type { GeneratingTestCompletion, TestCompletion } from '@/types/entities';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { createTest, streamTestGeneration } from '@/services/handlers';
	import { Button } from '@/components/ui/button';
	import type { GenerateTestDto } from '../../../api/tests/generate/+server';
	import GeneratingTestDetails from './components/GeneratingTestDetails.svelte';

	const { data }: { data: PageData } = $props();
	const { topic, numberOfQuestions, difficulty, model } = data.generationParams;

	type TestGenerationState =
		| { status: 'idle' }
		| { status: 'generating'; data: GeneratingTestCompletion }
		| { status: 'finished'; data: TestCompletion };

	let abortController = $state<AbortController | null>(null);

	let generatingTest = $state<TestGenerationState>({ status: 'idle' });

	const generate = async () => {
		abortController = new AbortController();
		try {
			await streamTestGeneration({
				body: {
					topic,
					difficulty,
					numberOfQuestions,
					model
				} as GenerateTestDto,
				signal: abortController.signal,
				onPartial: (partialData) => {
					generatingTest = {
						status: 'generating',
						data: partialData
					};
				},
				onComplete: async (finalData) => {
					generatingTest = {
						status: 'finished',
						data: finalData
					};
					toast.success('Generation is completed. Are you satisfied with the result?');
				}
			});
		} catch (e) {
			console.error(e);
			goto('/');
			toast.error('Failed to generate a test');
		}
	};
	onMount(generate);

	const onAbort = async () => {
		abortController?.abort();
		abortController = null;
		toast.success('Test generation is stopped');

		generatingTest = {
			status: 'idle'
		};
		goto('/');
	};

	const onConfirm = async () => {
		if (!generatingTest || generatingTest.status !== 'finished') return;

		toast.promise(createTest(generatingTest.data), {
			loading: 'Saving test...',
			success: (resp) => {
				console.log(resp);
				const id = resp.data;
				goto(`/test/${id}`);
				return 'Test is generated and saved successfully';
			},
			error: (err) => {
				console.error(err);
				return 'Test is failed to save';
			}
		});
	};
</script>

{#if generatingTest.status !== 'idle'}
	{#if generatingTest.status !== 'finished'}
		<Button onclick={onAbort} size="sm"><X size="16" />Stop generation</Button>
	{/if}

	<GeneratingTestDetails generatingTest={generatingTest.data} />
	{#if generatingTest.status === 'finished'}
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
