<script lang="ts">
	import { Sparkles } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import * as Popover from '@/components/ui/popover';
	import { Input } from '@/components/ui/input';
	import { Label } from '@/components/ui/label';
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import { toast } from 'svelte-sonner';
	import axios from 'axios';
	import type { GenerateQuestionDto } from '../../../(actions)/generate-question/+server';
	import { ChatCompletionStream } from 'openai/lib/ChatCompletionStream.mjs';
	import { v4 } from 'uuid';
	import type { Question, QuestionSchemaType, Survey } from '@/types/entities';
	import { parse } from 'partial-json';
	import { streamOpenAiResponse } from '@/utils/openai-stream';

	let isPopoverOpen = $state(false);
	let questionTopic = $state('');

	function togglePopover() {
		isPopoverOpen = !isPopoverOpen;
	}

	const onGenerate = async () => {
		const existingQuestions = currentSurveyStore.survey?.questions?.map((q) => q.question);
		if (!existingQuestions || !currentSurveyStore.survey?.id) {
			toast.error('Internal error: no existing survey');
			return;
		}

		const body: GenerateQuestionDto = {
			topic: questionTopic,
			existingQuestions,
			surveyId: currentSurveyStore.survey.id,
			surveyDifficulty: currentSurveyStore.survey.difficulty,
			surveyTitle: currentSurveyStore.survey.title
		};

		let optionsIds = [];

		let newQuestion = {
			id: v4(),
			question: '',
			answerType: '',
			correctAnswer: '',
			options: []
		} as Question;

		currentSurveyStore.survey.questions?.push(newQuestion);

		await streamOpenAiResponse<Partial<QuestionSchemaType>, QuestionSchemaType>({
			endpoint: '/generate-question',
			body,
			onPartial: (partial) => {
				if (partial.options?.length && partial.options?.length > optionsIds.length) {
					optionsIds.push(v4());
				}
				const questionIndex = currentSurveyStore.survey?.questions.length - 1;
				if (questionIndex < 0) {
					return;
				}
				if (currentSurveyStore.survey?.questions[questionIndex]) {
					currentSurveyStore.survey.questions[questionIndex] = {
						...newQuestion,
						...partial
					};
					return;
				}
			}
		});
	};
</script>

<div class="relative w-full">
	<Popover.Root>
		<Popover.Trigger class="w-full">
			<Button
				disabled={currentSurveyStore.isGenerating}
				size="sm"
				variant="outline"
				class="relative flex w-full items-center justify-center gap-x-1 rounded-l-none"
				on:click={togglePopover}
			>
				<Sparkles size="16" />
				Generate question
			</Button>
		</Popover.Trigger>
		<Popover.Content side="top">
			<Label>About...</Label>
			<p class="text-xs opacity-50">Enter a topic to generate a question about</p>
			<Input disabled={currentSurveyStore.isGenerating} bind:value={questionTopic} class="mt-1.5" />
			<Button
				onclick={onGenerate}
				disabled={currentSurveyStore.isGenerating}
				variant="ghost"
				size="sm"
				class="mt-2 gap-x-1"
			>
				<Sparkles size="16" />
				Generate
			</Button>
		</Popover.Content>
	</Popover.Root>
</div>
