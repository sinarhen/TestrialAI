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
	import Separator from '@client/components/ui/separator/separator.svelte';
	import type { TestState } from './types';
	import AddQuestionButton from './components/AddQuestionButton.svelte';
	import GenerateQuestionButton from './components/GenerateQuestionButton.svelte';
	import TestDetails from './components/TestDetails.svelte';
	import ShareTestDialog from './components/TestActions/ShareTestDialog.svelte';
	import DeleteTestButton from './components/TestActions/DeleteTestButton.svelte';
	import SettingsTestDialog from './components/TestActions/SettingsTestDialog.svelte';
	import TakeTestDialog from './components/TestActions/TakeTestDialog/index.svelte';
	import SessionsTestDialog from './components/TestActions/SessionsTestDialog/index.svelte';

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
			answerExplanation: null,
			codeBlock: null,
			codeLang: null
		});
</script>

<div class="flex gap-x-2">
	<TakeTestDialog testTitle={serverData.test.title} testId={serverData.test.id} />
	<SessionsTestDialog sessions={serverData.test.sessions} />
	<!-- <SettingsTestDialog /> -->
	<ShareTestDialog testId={serverData.test.id} />
	<Separator orientation="vertical" class="motion-opacity-in-0 motion-delay-[150ms]" />
	<DeleteTestButton testId={serverData.test.id} />
</div>

<h2 class="mt-7 text-2xl font-bold motion-opacity-in-0 motion-duration-1500 motion-delay-200">
	{test.title}
</h2>
<div class="mt-3 flex gap-x-4 text-sm">
	<span class="flex items-center gap-x-1 motion-opacity-in-0 motion-delay-300"> </span>
</div>
<TestDetails {test} initialQuestionsCount={serverData.test.questions.length} />

<div
	style={`--delay: ${200 + 150 * (test.questions.length + 1)}ms`}
	class={`mt-16 flex -motion-translate-y-in-25 motion-opacity-in-0 motion-delay-[--delay]`}
>
	<AddQuestionButton {onCreateQuestion} />
	<GenerateQuestionButton bind:test />
</div>
