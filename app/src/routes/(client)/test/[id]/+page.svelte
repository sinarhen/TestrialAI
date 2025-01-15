<script lang="ts">
	import {
		CircleHelp,
		Gauge,
		Layers,
		Link,
		List,
		Play,
		Settings,
		Share,
		Trash2
	} from 'lucide-svelte';
	import type { PageServerData } from './$types';
	import { Button } from '@/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { deleteTest } from '@/services/handlers';
	import { goto, invalidate } from '$app/navigation';
	import * as Dialog from '@/components/ui/dialog';
	import Separator from '@/components/ui/separator/separator.svelte';
	import type { TestState } from './types';
	import AddQuestionButton from './components/AddQuestionButton.svelte';
	import GenerateQuestionButton from './components/GenerateQuestionButton.svelte';
	import TestDetails from './components/TestDetails.svelte';
	import ShareTestDialog from './components/TestActions/ShareTestDialog.svelte';
	import DeleteTestButton from './components/TestActions/DeleteTestButton.svelte';
	import SettingsTestDialog from './components/TestActions/SettingsTestDialog.svelte';
	import TakeTestDialog from './components/TestActions/TakeTestDialog.svelte';

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
			status: 'new',
			answerExplanation: null
		});
</script>

<div class="flex gap-x-2">
	<TakeTestDialog />
	<SettingsTestDialog />
	<ShareTestDialog testId={serverData.test.id} />
	<Separator orientation="vertical" class="motion-delay-[150ms] motion-opacity-in-0" />
	<DeleteTestButton testId={serverData.test.id} />
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
