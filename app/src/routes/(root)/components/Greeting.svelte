<script lang="ts">
	import { Difficulties, type Survey, type SurveySchemaType } from '@/types/entities';
	import { Input } from '@/components/ui/input';
	import { Button } from '@/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import { fade } from 'svelte/transition';
	import type { SupportedModel } from '@/types/openai';
	import type { Selected } from 'bits-ui';
	import { parse } from 'partial-json';

	import * as RadioGroup from '@/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '@/components/ui/label';
	import { ChatCompletionStream } from 'openai/lib/ChatCompletionStream';
	import { streamOpenAiResponse } from '@/utils/openai-stream';

	let {
		userName = 'stranger'
	}: {
		userName?: string;
	} = $props();

	const modelList: Selected<SupportedModel>[] = [
		{ label: 'GPT-4o', value: 'gpt-4o' },
		{ label: 'GPT-4o mini', value: 'gpt-4o-mini' }
	];

	let topic = $state<string | undefined>();
	let modelSelected = $state<Selected<SupportedModel> | undefined>(modelList[0]);
	let difficulty = $state<string | undefined>(Difficulties.HARD);
	let numberOfQuestions = 6;

	const onGenerateSurvey = async () =>
		await streamOpenAiResponse<Partial<Survey>, Survey>({
			endpoint: '/generate-survey',
			body: {
				topic,
				difficulty,
				numberOfQuestions
			},
			onPartial: (partialSurvey) => {
				// You can update the UI with partial data
				currentSurveyStore.isGenerating = true;

				currentSurveyStore.survey = partialSurvey;
			},
			onComplete: (finalSurvey) => {
				currentSurveyStore.survey = finalSurvey;
				toast.success('Survey generated');
			},
			onError: (err) => {
				console.error(err);
				toast.error('Failed to generate survey');
			},
			onFinish: () => {
				currentSurveyStore.isGenerating = false;
			}
		});
</script>

<div class="flex h-[65vh] w-full flex-grow flex-col items-center justify-center">
	<div class="flex flex-col items-center justify-end">
		<h1 class="animate-fadeInSlide text-3xl">
			Hello, <span class="font-semibold">{userName}</span>👋
		</h1>
		<p class="animate-fadeInSlide mt-0.5 opacity-0 [animation-delay:0.3s]">
			Give us a topic you want to create a survey on
		</p>
		<div class="mt-2 flex w-full items-center justify-center gap-x-1">
			<Input
				name="topic"
				disabled={currentSurveyStore.isGenerating}
				bind:value={topic}
				placeholder="Napoleonic wars"
				class="w-[350px]"
			/>
			<Select.Root
				selected={modelSelected}
				onSelectedChange={(val) => (modelSelected = val)}
				name="model"
			>
				<Select.Trigger class="w-32 whitespace-nowrap ">
					<Select.Value />
				</Select.Trigger>
				<Select.Content>
					{#each modelList as model (model)}
						<Select.Item class="whitespace-nowrap" value={model.value}>
							{model.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<RadioGroup.Root bind:value={difficulty} class="mt-2 flex w-full gap-x-4">
			{#each Object.values(Difficulties) as diff}
				<div class="items center flex space-x-2">
					<RadioGroup.Item value={diff} id={diff} />
					<Label for={diff}>{diff}</Label>
				</div>
			{/each}
		</RadioGroup.Root>

		<Button
			onclick={onGenerateSurvey}
			disabled={currentSurveyStore.isGenerating}
			type="submit"
			class="mt-2"
		>
			Create survey
		</Button>
	</div>
</div>

{#if currentSurveyStore.isGenerating}
	<div
		class="relative flex h-full w-full flex-col items-center justify-center text-sm text-gray-500"
	>
		<div transition:fade={{ duration: 500 }} class="flex animate-pulse items-center gap-x-2">
			<span>Loading...</span>
		</div>
	</div>
{/if}
