<script lang="ts">
	import { parseClientResponse } from '@/client/utils/api.js';
	import { Check, Trash, X } from 'lucide-svelte';
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { Button } from '@client/components/ui/button';
	import GeneratingTestDetails from './components/GeneratingTestDetails.svelte';
	import { api } from '@/client/api';
	import type { GenerateTestParamsDto } from '@/server/api/tests/dtos/generate-test-params.dto';
	import { streamOpenAiResponse } from '@/client/utils/openai-stream';
	import type {
		GeneratedTestDto,
		GeneratingTestDto
	} from '@/server/api/tests/dtos/generated-test.dto';
	import { HTTPException } from 'hono/http-exception';

	const { data }: { data: PageData } = $props();
	const { topic, numberOfQuestions, model } = data.generationParams;

	type TestGenerationState =
		| { status: 'idle' }
		| { status: 'generating'; data: GeneratingTestDto }
		| { status: 'finished'; data: GeneratedTestDto };

	let abortController = $state<AbortController | null>(null);

	let generatingTest = $state<TestGenerationState>({ status: 'idle' });

	const generate = async () => {
		abortController = new AbortController();
		try {
			await streamOpenAiResponse<GeneratedTestDto>({
				endpoint: api().tests.generate.$url().toString(),
				body: {
					topic,
					numberOfQuestions,
					model
				} as GenerateTestParamsDto,
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

		const resp = await api()
			.tests.$post({
				json: generatingTest.data
			})
			.then(parseClientResponse);

		console.log('resp', resp);
		if (resp.error) {
			toast.error(resp.error);
		}
		if (resp.data) {
			toast.success('Test is successfully saved');
			const { testId } = resp.data;
			goto(`/test/${testId}`);
			return;
		}
		console.error('Failed to save the test: No data returned', resp);
		toast.error('Failed to save the test: No data returned');
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
