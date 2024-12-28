<script lang="ts">
	import {Difficulties, Models} from '@/types';
	import { Input } from '@/components/ui/input';
	import { Button } from '@/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import { fade } from 'svelte/transition';
	import type { Model } from '@/types';
	import type { Selected } from 'bits-ui';
	import { parse } from "partial-json";

	import * as RadioGroup from '@/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '@/components/ui/label';
	import {ChatCompletionStream} from "openai/lib/ChatCompletionStream";

	let {
		userName = 'stranger'
	}: {
		userName?: string;
	} = $props();

	const modelList = Object.entries(Models).map(([k, v]) => ({
		label: k,
		value: v
	}));

	let topic = $state<string | undefined>();
	let modelSelected = $state<Selected<Model> | undefined>(modelList[0]);
	let difficulty = $state<string | undefined>(Difficulties.HARD);
	let numberOfQuestions = 6;

	function onGenerate() {
		if (!topic || !difficulty || !modelSelected) {
			toast.error('Please fill in all fields');
			return;
		}
		fetch('/generate-survey', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				topic,
				difficulty,
				model: modelSelected.value,
				numberOfQuestions
			})
		}).then(async res => {
			if (res.body && res.status === 200) {
				const runner = ChatCompletionStream.fromReadableStream(res.body);

				runner.on('content.delta', ({snapshot}) => {
					const survey = parse(snapshot);
					currentSurveyStore.survey = survey;
				})

				runner.on('content.done', (content) => {
					const survey = parse(content.content);
					currentSurveyStore.survey = survey;
					toast.success('Survey generated');
				})

			} else {
				toast.error('Failed to generate survey');
			}
		}).catch(e => {
			console.error(e)
			toast.error('Failed to generate survey');
		}).finally(() => {
			currentSurveyStore.isGenerating = false;
		});

	}
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
				items={modelList}
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
			onclick={onGenerate}
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
