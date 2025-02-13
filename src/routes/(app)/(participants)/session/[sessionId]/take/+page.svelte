<script lang="ts">
	import * as RadioGroup from '@/components/ui/radio-group';
	import QuestionTitle from '../../../../(creators)/test/[id]/components/components/TestDetailsQuestion/Header/QuestionTitle.svelte';
	import QuestionCodeBlock from '../../../../(creators)/test/[id]/components/QuestionCodeBlock.svelte';
	import { Label } from '@/components/ui/label';
	import { Checkbox } from '@/components/ui/checkbox';
	import { Input } from '@/components/ui/input';
	import { User } from 'lucide-svelte';
	import Button from '@/components/ui/button/button.svelte';
	import { onMount } from 'svelte';

	const { data } = $props();

	// TODO: Poll participants count
	const { durationInMinutes, testStateJson: test, participantsCount } = data.testSession;

	let timer = $state(durationInMinutes * 60);
	let minutes = $derived(Math.floor(timer / 60));
	let seconds = $derived(timer % 60);

	let isSyncing = $state(false);
	let areAnswersModified = $state(false);

	const endTest = () => {
		console.log('Test ended');
	};

	const interval = setInterval(() => {
		if (timer > 0) {
			timer--;
		} else {
			endTest();
			clearInterval(interval);
		}
	}, 1000);

	const displayableName =
		data.user?.firstName && data.user?.lastName
			? data.user.firstName + data.user.lastName
			: data.user?.username || 'Guest';

	let localAnswers = $state<Record<string, any>>({});
	onMount(() => {
		const saved = localStorage.getItem('testAnswers');
		if (saved) {
			localAnswers = JSON.parse(saved);
		}

		const intervalId = setInterval(() => {
			if (isSyncing || !areAnswersModified) return;

			isSyncing = true;
			syncAnswersToServer(localAnswers).finally(() => {
				isSyncing = false;
				areAnswersModified = false;
			});
		}, 10000);

		return () => clearInterval(intervalId);
	});

	function handleAnswerChange(questionId: string, newValue: any) {
		areAnswersModified = true;
		localAnswers[questionId] = newValue;
		localStorage.setItem('testAnswers', JSON.stringify(localAnswers));
	}

	async function syncAnswersToServer(answersObj: Record<string, any>) {}
</script>

<div class=" flex flex-col items-center">
	<h2 class="text-lg font-medium">{minutes}: {seconds}</h2>
	<p>Time left</p>
</div>
<div class="mt-7 flex w-full justify-between">
	<div>
		<h1 class="text-2xl font-bold motion-opacity-in-0 motion-duration-1500 motion-delay-200">
			{test.title}
		</h1>

		<div class="mt-0.5 flex gap-x-2">
			<span class="flex items-center gap-x-1 text-sm">
				<User size="16" />
				{participantsCount} participants
			</span>
		</div>
	</div>
	<div class="text-right text-sm">
		You are logged in as <br />{displayableName}
	</div>
</div>

<main class="relative mt-8 flex h-full w-full flex-col">
	<section class="flex w-full flex-col gap-y-12">
		{#each test.questions ?? [] as question}
			<div>
				<header class="mb-5 mt-0.5 inline-flex w-full justify-between gap-x-7">
					<div class="w-full">
						<QuestionTitle questionTitle={question.question} />
						{#if question.codeBlock && question.codeBlock.length > 0}
							<div class="mt-1">
								<QuestionCodeBlock
									isGenerating={false}
									codeBlock={question.codeBlock}
									codeLanguage={question.codeLang}
								/>
							</div>
						{/if}
					</div>
				</header>
				{#if question.answerType === 'single'}
					<RadioGroup.Root class="flex flex-col gap-y-2" value="option-one">
						{#if question.options}
							{#each question.options as option, index}
								<div class="flex items-center space-x-2">
									<RadioGroup.Item value={option?.value ?? 'No value'} />
									<Label for={`radio-${question.question}-${index}`}>{option?.value}</Label>
								</div>
							{/each}
						{/if}
					</RadioGroup.Root>
				{:else if question.answerType === 'multiple'}
					{#if question.options}
						<div class="flex flex-col gap-y-2">
							{#each question.options as option, index}
								<div class="flex items-center space-x-2">
									<Checkbox id={`checkbox-${question.question}-${index}`} />
									<Label for={`checkbox-${question.question}-${index}`}>
										{option?.value}
									</Label>
								</div>
							{/each}
						</div>
					{/if}
				{:else if question.answerType === 'text'}
					<Input type="text" class="mt-2 max-w-[400px]" />
				{/if}
			</div>
		{/each}
		<Button class="md:w-fit">Submit</Button>
	</section>
</main>
