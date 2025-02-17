<script lang="ts">
	import * as RadioGroup from '@client/components/ui/radio-group';
	import QuestionTitle from '../../../../(creators)/test/[id]/components/components/TestDetailsQuestion/Header/QuestionTitle.svelte';
	import QuestionCodeBlock from '../../../../(creators)/test/[id]/components/QuestionCodeBlock.svelte';
	import { Label } from '@client/components/ui/label';
	import { Checkbox } from '@client/components/ui/checkbox';
	import { Input } from '@client/components/ui/input';
	import { User } from 'lucide-svelte';
	import Button from '@client/components/ui/button/button.svelte';
	import { onMount } from 'svelte';
	import { api } from '@/client/api';
	import { parseClientResponse } from '@/client/utils/api';

	const { data } = $props();

	const { durationInMinutes, testStateJson: test, participantsCount } = data.testSession;

	let timer = $state(data.testSession.timeLeft);
	let formattedTime = $derived(formatTime(timer));

	function formatTime(seconds: number | null) {
		if (!seconds) return '00:00';
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	}

	let isSyncing = $state(false);
	let areAnswersModified = $state(false);

	const endTest = () => {
		console.log('Test ended');
	};

	// TODO: DO not allow users submit the test if they exceed the time limit on the server side
	const interval = !!timer
		? setInterval(() => {
				if (timer > 0) {
					timer--;
				} else {
					endTest();
					clearInterval(interval);
				}
			}, 1000)
		: null;

	const displayableName =
		data.user?.firstName && data.user?.lastName
			? data.user.firstName + data.user.lastName
			: data.user?.username || 'Guest';

	let localAnswers = $state<{
		[questionId: string]: {
			selectedOptionIds?: Set<string>;
			typedAnswer?: string;
		};
	}>({});

	onMount(() => {
		const saved = localStorage.getItem(`testAnswers_${data.token}`);
		if (saved) {
			localAnswers = syncFromLocalStorage();
		}

		const intervalId = setInterval(() => {
			if (isSyncing || !areAnswersModified) return;
			isSyncing = true;
			syncAnswersToServer().finally(() => {
				isSyncing = false;
				areAnswersModified = false;
			});
		}, 5000);

		return () => clearInterval(intervalId);
	});

	function handleOptionChosen(questionId: string, optionId: string) {
		areAnswersModified = true;
		const existingSet = localAnswers[questionId]?.selectedOptionIds ?? new Set();
		localAnswers[questionId] = {
			selectedOptionIds: new Set([...existingSet, optionId])
		};
		syncToLocalStorage();
	}

	function handleTextAnswerChange(questionId: string, newValue: string) {
		areAnswersModified = true;
		localAnswers[questionId] = {
			typedAnswer: newValue
		};
		syncToLocalStorage();
	}

	function syncFromLocalStorage() {
		const parsed = JSON.parse(localStorage.getItem(`testAnswers_${data.token}`) ?? '{}');
		return Object.fromEntries(
			Object.entries(parsed).map(([qId, answer]) => [
				qId,
				{
					...answer,
					selectedOptionIds: answer.selectedOptionIds
						? new Set(answer.selectedOptionIds)
						: undefined
				}
			])
		);
	}

	function syncToLocalStorage() {
		// Convert Sets to arrays before storing
		const serializable = Object.fromEntries(
			Object.entries(localAnswers).map(([qId, answer]) => [
				qId,
				{
					...answer,
					selectedOptionIds: answer.selectedOptionIds
						? Array.from(answer.selectedOptionIds)
						: undefined
				}
			])
		);
		localStorage.setItem(`testAnswers_${data.token}`, JSON.stringify(serializable));
	}

	function serializeAnswers() {
		return Object.entries(localAnswers).map(([questionId, answer]) => ({
			questionId,
			typedAnswer: answer.typedAnswer,
			selectedOptionIds: Array.from(answer.selectedOptionIds ?? [])
		}));
	}

	async function syncAnswersToServer() {
		const response = await api()
			['test-sessions'][':testSessionToken'].sync.$post({
				param: { testSessionToken: data.token },
				json: serializeAnswers()
			})
			.then(parseClientResponse);

		if (response.error) {
			// we have everything in a local storage, so its not a big deal
			// toast.error(
			// 	'Error syncing answers: ' +
			// 		response.error +
			// 		'\nPlease do '
			// );
		} else {
			// toast.success('Answers synced successfully');
		}
	}

	async function submitTest() {
		if (areAnswersModified) {
			await syncAnswersToServer();
		}

		endTest();
	}
</script>

<div class=" flex flex-col items-center">
	<h2 class="text-lg font-medium">{formattedTime}</h2>
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
				<!-- {#if question.answerType === 'single'}
					<RadioGroup.Root
						class="flex flex-col gap-y-2"
						value={localAnswers[question.id]?.selectedOptionIds?.values().next().value}
					>
					{#if question.options}
						{#each question.options as option, index}
							<div class="flex items-center space-x-2">
								<Checkbox
									checked={localAnswers[question.id]?.selectedOptionIds?.has(option.id)}
									id={`checkbox-${question.question}-${index}`}
									onclick={() => handleOptionChosen(question.id, option.id)}
								/>
								<Label for={`checkbox-${question.question}-${index}`}>{option?.value}</Label>
							</div>
						{/each}
					{/if}
					</RadioGroup.Root> -->
				{#if question.answerType !== 'text'}
					{#if question.options}
						<div class="flex flex-col gap-y-2">
							{#each question.options as option, index}
								<div class="flex items-center space-x-2">
									<Checkbox
										checked={localAnswers[question.id]?.selectedOptionIds?.has(option.id)}
										id={`checkbox-${question.question}-${index}`}
										onclick={() => handleOptionChosen(question.id, option.id)}
									/>
									<Label for={`checkbox-${question.question}-${index}`}>
										{option?.value}
									</Label>
								</div>
							{/each}
						</div>
					{/if}
				{:else if question.answerType === 'text'}
					<Input
						oninput={(e) => handleTextAnswerChange(question.id, e.target?.value)}
						type="text"
						class="mt-2 max-w-[400px]"
					/>
				{/if}
			</div>
		{/each}
		<Button onclick={submitTest} class="md:w-fit">Submit</Button>
	</section>
</main>
