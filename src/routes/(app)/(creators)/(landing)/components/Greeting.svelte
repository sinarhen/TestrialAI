<script lang="ts">
	import { Input } from '@client/components/ui/input';
	import { Button } from '@client/components/ui/button';
	import { toast } from 'svelte-sonner';
	import type { SupportedModel } from '@/client/types/openai';
	import type { Selected } from 'bits-ui';
	import * as Select from '@client/components/ui/select';
	import { Slider } from '@client/components/ui/slider/index';
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
	let numberOfQuestions = $state<number>(10);

	const onGenerateTest = async () => {
		if (!topic) {
			toast.error('Please provide a topic');
			return;
		}
		const params = new URLSearchParams();
		params.append('topic', topic);
		params.append('model', modelSelected?.value ?? '');
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
