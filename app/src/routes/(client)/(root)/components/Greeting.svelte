<script lang="ts">
	import { Difficulties, type Difficulty, type TestCompletion } from '@/types/entities';
	import { Input } from '@/components/ui/input';
	import { Button } from '@/components/ui/button';
	import { toast } from 'svelte-sonner';
	import type { SupportedModel } from '@/types/openai';
	import type { Selected } from 'bits-ui';

	import * as RadioGroup from '@/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '@/components/ui/label';
	import { Slider } from '$lib/components/ui/slider/index';
	import { goto } from '$app/navigation';

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
	let difficulty = $state<Difficulty>(Difficulties.HARD);
	let numberOfQuestions = $state<number>(10);

	const onGenerateTest = async () => {
		if (!topic) {
			toast.error('Please provide a topic');
			return;
		}
		const params = new URLSearchParams();
		params.append('topic', topic);
		params.append('model', modelSelected?.value ?? '');
		params.append('difficulty', difficulty);
		params.append('numberOfQuestions', numberOfQuestions.toString());

		goto('/test/generate?' + params.toString());

		return;
	};
</script>

<div class="flex h-[65vh] w-full flex-grow flex-col items-center justify-center">
	<div class="flex flex-col items-center justify-end">
		<h1 class="text-3xl">
			Hello, <span class="font-semibold">{userName}</span>👋
		</h1>
		<p class="mt-0.5">Give us a topic you want to create a test on</p>
		<div class="mt-5 flex w-full items-center justify-center gap-x-1">
			<Input name="topic" bind:value={topic} placeholder="Napoleonic wars" class="w-[350px]" />
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
		<div class="flex w-full items-center justify-between gap-x-5">
			<RadioGroup.Root bind:value={difficulty} class="mt-5 flex w-full gap-x-5">
				{#each Object.values(Difficulties) as diff}
					<div class="items center flex space-x-2">
						<RadioGroup.Item value={diff} id={diff} />
						<Label for={diff}>{diff}</Label>
					</div>
				{/each}
			</RadioGroup.Root>

			<div class="mt-4 flex w-full flex-col items-end gap-y-1 whitespace-nowrap text-right text-sm">
				<Slider
					class="mt-2 w-1/2"
					value={[numberOfQuestions]}
					onValueChange={(val) => (numberOfQuestions = val[0])}
					max={14}
					min={6}
					step={1}
				/>
				{numberOfQuestions} questions
			</div>
		</div>

		<Button onclick={onGenerateTest} type="submit" class="mt-5">Create test</Button>
	</div>
</div>
