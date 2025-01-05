<script lang="ts">
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import {
		CircleHelp,
		Gauge,
		PlusCircle,
		PlusCircleIcon,
		Save,
		Share,
		Share2,
		Timer,
		Trash2
	} from 'lucide-svelte';
	import QuestionList from '../(components)/QuestionList/QuestionList.svelte';
	import type { PageServerData } from './$types';
	import { Button } from '@/components/ui/button';
	import axios, { type AxiosError } from 'axios';
	import { toast } from 'svelte-sonner';
	import { v4 as uuidv4 } from 'uuid';
	import { updateSurvey } from '@/actions';
	import AddQuestionButton from './(components)/AddQuestionButton.svelte';
	import GenerateQuestionButton from './(components)/GenerateQuestionButton.svelte';

	const {
		data
	}: {
		data: PageServerData;
	} = $props();

	$effect(() => {
		currentSurveyStore.survey = data.survey;
		currentSurveyStore.isGenerating = false;
	});

	const saveCurrentSurvey = async () => {
		if (!currentSurveyStore.survey) return;

		try {
			const res = await updateSurvey(currentSurveyStore.survey);
			if (res.status !== 200) {
				throw new Error('Failed to save survey');
			}
			currentSurveyStore.isDirty = false;
			toast.success('Survey saved');
		} catch (e: unknown) {
			console.error(e);
			if (axios.isAxiosError(e)) {
				toast.error('Failed to save survey');
			}
		}
	};

	function onCreateQuestion() {
		if (!currentSurveyStore.survey) return;
		const qs = currentSurveyStore.survey.questions;
		currentSurveyStore.survey.questions = [
			...(qs ?? []),
			{
				id: uuidv4(),
				question: 'New question',
				correctAnswer: null,
				answerType: 'single',
				options: [
					{ id: uuidv4(), value: 'Option 1', isCorrect: true },
					{ id: uuidv4(), value: 'Option 2', isCorrect: false },
					{ id: uuidv4(), value: 'Option 3', isCorrect: false },
					{ id: uuidv4(), value: 'Option 4', isCorrect: false }
				]
			}
		];

		currentSurveyStore.isDirty = true;
	}
</script>

{#if currentSurveyStore.survey}
	<div class="flex gap-x-2">
		<!-- <Button class="mt-4" variant="default" size="sm" onclick={() => {}}
			>Back to the main page</Button
		> -->
		<Button
			variant="outline"
			size="sm"
			class="-motion-translate-y-in-50 motion-opacity-in-0 motion-duration-500  gap-x-1"
			onclick={() => {}}>Generate new <PlusCircle size="12" /></Button
		>
		<Button
			class="-motion-translate-y-in-50 motion-delay-[75ms] motion-opacity-in-0 motion-duration-500 gap-x-1"
			variant="outline"
			size="sm"
			onclick={() => {}}>Delete <Trash2 size="12" /></Button
		>
		<Button
			class="-motion-translate-y-in-50 motion-delay-[150ms] motion-opacity-in-0 motion-duration-500 gap-x-1"
			variant="outline"
			size="sm"
			onclick={() => {}}>Export <Share size="12" /></Button
		>
	</div>
	<h2
		class="motion-opacity-in-0 motion-preset-confetti motion-duration-1500 motion-delay-200 mt-7 text-2xl font-bold"
	>
		{currentSurveyStore.survey.title}
	</h2>

	<div class="mt-3 flex gap-x-4 text-sm">
		<span class="motion-opacity-in-0 motion-delay-300 flex items-center gap-x-1"
			><CircleHelp size="12" /> {currentSurveyStore.survey.questions?.length} Questions</span
		>
		<span class="motion-delay-300 motion-opacity-in-0 flex items-center gap-x-1"
			><Gauge size="12" /> {currentSurveyStore.survey.difficulty}</span
		>
	</div>
	<QuestionList />

	<div class="mt-16 flex">
		<AddQuestionButton onCreate={onCreateQuestion} />
		<GenerateQuestionButton />
	</div>

	<div class="mt-8 flex w-full justify-center xl:justify-start">
		<div class="flex w-full gap-x-2">
			<Button
				onclick={saveCurrentSurvey}
				type="submit"
				disabled={!currentSurveyStore.isDirty}
				class="w-full gap-x-1"
			>
				<Save size="16" />
				Save
			</Button>
			<Button variant="outline" class="col-span-4 inline-flex gap-x-1 xl:hidden">
				<Share2 size="16" />
				Share
			</Button>
		</div>
	</div>
{/if}
