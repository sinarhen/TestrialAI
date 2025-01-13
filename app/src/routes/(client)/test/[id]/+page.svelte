<script lang="ts">
	import { CircleHelp, Gauge, Link, Play, Settings, Share, Trash2 } from 'lucide-svelte';
	import type { PageServerData } from './$types';
	import { Button } from '@/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { deleteTest } from '@/services/handlers';
	import { goto, invalidate } from '$app/navigation';
	import * as Dialog from '@/components/ui/dialog';
	import Separator from '@/components/ui/separator/separator.svelte';
	import * as AlertDialog from '@/components/ui/alert-dialog';
	import type { TestState } from './types';
	import AddQuestionButton from './components/AddQuestionButton.svelte';
	import GenerateQuestionButton from './components/GenerateQuestionButton.svelte';
	import TestDetails from './components/TestDetails.svelte';
	import { browser } from '$app/environment';

	const {
		data: serverData
	}: {
		data: PageServerData;
	} = $props();

	let test = $state<TestState>({
		...serverData.test,
		questions: serverData.test.questions.map((q) => ({
			...q,
			status: 'saved'
		}))
	});

	const onCreateQuestion = () =>
		test.questions.push({
			question: 'New question',
			correctAnswer: null,
			answerType: 'single',
			options: [
				{ value: 'Option 1', isCorrect: true },
				{ value: 'Option 2', isCorrect: false },
				{ value: 'Option 3', isCorrect: false },
				{ value: 'Option 4', isCorrect: false }
			],
			status: 'new'
		});

	const onPdfExport = () => {
		window.location.href = `/api/tests/${test.id}/pdf`;
		toast.success('Downloaded started');
	};

	const onCopyLink = () => {
		navigator.clipboard.writeText(shareLink);
		toast.success('Link copied to clipboard');
	};
	const shareLink = browser
		? `${window.location.origin}/test/${serverData.test.id}/share`
		: 'Unable to copy link';

	$inspect(serverData.test);
</script>

<div class="flex gap-x-2">
	<Button size="sm" class="gap-x-1">
		Take a test
		<Play size="12" />
	</Button>
	<Button
		variant="outline"
		size="sm"
		class="-motion-translate-y-in-50 motion-opacity-in-0 motion-duration-500  gap-x-1"
		onclick={() => {
			toast.info('Not implemented yet');
		}}>Settings <Settings size="12" /></Button
	>
	<Dialog.Root>
		<Dialog.Trigger>
			<Button
				variant="outline"
				size="sm"
				class="-motion-translate-y-in-50 motion-delay-[75ms] motion-opacity-in-0 motion-duration-500 gap-x-1"
			>
				Share <Share size="12" />
			</Button>
		</Dialog.Trigger>
		<Dialog.Content>
			<Dialog.Header>
				<Dialog.Title>Share test</Dialog.Title>
			</Dialog.Header>
			<Dialog.Description>Share this test with your friends</Dialog.Description>
			<div>
				<Button
					onclick={onCopyLink}
					variant="outline"
					class=" flex h-auto w-full cursor-pointer gap-x-1 text-sm outline-2 hover:outline"
				>
					Link <Link size="12" /> <br />
				</Button>
				<p class="mt-1 text-center text-xs opacity-50">Click to copy</p>
			</div>
			<Separator class="mb-4 mt-3" />
			<!-- <Dialog.Footer>
					<Button>Copy link</Button>
				</Dialog.Footer> -->
			<div>
				<p class="text-center text-xs opacity-50">Or export as:</p>
				<!-- <Button
						class="mt-2 flex h-12 w-full items-center justify-center rounded-md border text-xs"
					>
						Google forms
					</Button> -->
				<Button
					onclick={onPdfExport}
					variant="outline"
					class="mt-2 flex h-12 w-full items-center justify-center rounded-md border text-xs"
				>
					PDF
				</Button>
				<Button
					variant="outline"
					class="mt-2 flex h-12 w-full items-center justify-center rounded-md border text-xs"
				>
					Google forms
				</Button>
			</div>
		</Dialog.Content>
	</Dialog.Root>
	<Separator orientation="vertical" class="motion-delay-[150ms] motion-opacity-in-0" />

	<AlertDialog.Root>
		<AlertDialog.Trigger asChild let:builder>
			<Button
				class="-motion-translate-y-in-50 motion-delay-[150ms] motion-opacity-in-0 motion-duration-500 gap-x-1"
				size="sm"
				onclick={() => {}}
				builders={[builder]}
				variant="outline"
			>
				Delete <Trash2 size="12" />
			</Button>
		</AlertDialog.Trigger>
		<AlertDialog.Content>
			<AlertDialog.Header>
				<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
				<AlertDialog.Description>
					This action cannot be undone. This will permanently delete this test and remove data from
					our servers.
				</AlertDialog.Description>
			</AlertDialog.Header>
			<AlertDialog.Footer>
				<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
				<AlertDialog.Action
					onclick={() => {
						if (test?.id) {
							deleteTest(test.id)
								.then((res) => {
									if (res.status < 300 && res.status >= 200) {
										toast.success('Test is deleted successfully');

										goto('/');
										invalidate('/');
									}
								})
								.catch((err) => {
									console.error(err);
									toast.error('Something went wrong. Please try again later');
								});
						} else {
							console.error('Test has no ID');
							toast.error('Internal error. Please try again later.');
						}
					}}>Continue</AlertDialog.Action
				>
			</AlertDialog.Footer>
		</AlertDialog.Content>
	</AlertDialog.Root>
</div>
<h2
	class="motion-opacity-in-0 motion-preset-confetti motion-duration-1500 motion-delay-200 mt-7 text-2xl font-bold"
>
	{test.title}
</h2>
<div class="mt-3 flex gap-x-4 text-sm">
	<span class="motion-opacity-in-0 motion-delay-300 flex items-center gap-x-1"
		><CircleHelp size="12" /> {test?.questions?.length} Questions</span
	>
	<!-- <span class="flex items-center gap-x-1"><Timer size="12" /> 10 Minutes</span> -->
</div>
<TestDetails {test} initialQuestionsCount={serverData.test.questions.length} />

<div class="mt-16 flex">
	<AddQuestionButton {onCreateQuestion} />
	<GenerateQuestionButton bind:test />
</div>
