<script lang="ts">
	import { Sparkles } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import * as Popover from '@/components/ui/popover';
	import { Input } from '@/components/ui/input';
	import { Label } from '@/components/ui/label';
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import { toast } from 'svelte-sonner';
	import type { GenerateQuestionDto } from '../../../(api)/generate-question/+server';
	import { v4 } from 'uuid';
	import type { Question, QuestionSchemaType, Survey } from '@/types/entities';
	import { streamOpenAiResponse } from '@/utils/openai-stream';

	let isPopoverOpen = $state(false);
	let questionTopic = $state('');

	const onGenerate = async () => {
		if (currentSurveyStore.isGenerating) {
			toast.error('Already generating a question');
			return;
		}

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

		let optionsIds: string[] = [];

		let newQuestion = {
			id: v4(),
			question: '',
			answerType: '',
			correctAnswer: '',
			options: []
		} as Question;

		currentSurveyStore.survey.questions?.push(newQuestion);
		const generatedQuestionIndex = (currentSurveyStore.survey?.questions.length ?? 1) - 1;

		currentSurveyStore.isGenerating = true;
		await streamOpenAiResponse<Partial<QuestionSchemaType>, QuestionSchemaType>({
			endpoint: '/generate-question',
			body,
			onPartial: ({ partialData }) => {
				if (partialData.options?.length && partialData.options?.length > optionsIds.length) {
					optionsIds.push(v4());
				}
				if (currentSurveyStore.survey?.questions[generatedQuestionIndex]) {
					currentSurveyStore.survey.questions[generatedQuestionIndex] = {
						...newQuestion,
						...partialData,
						options:
							partialData.options?.map((option, index) => ({
								...option,
								id: optionsIds[index]
							})) ?? []
					};
					currentSurveyStore.isDirty = true;
				}
			},
			onComplete: ({ finalData }) => {
				const questionIndex = (currentSurveyStore.survey?.questions.length ?? 0) - 1;
				if (questionIndex < 0) {
					return;
				}
				const question = finalData;

				if (currentSurveyStore.survey?.questions[questionIndex]) {
					currentSurveyStore.survey.questions[questionIndex] = {
						...newQuestion,
						...question,
						options:
							question.options?.map((option, index) => ({
								...option,
								id: optionsIds[index]
							})) ?? []
					};
				}

				isPopoverOpen = false;
				questionTopic = '';
				currentSurveyStore.isDirty = true;
				currentSurveyStore.isGenerating = false;
			},
			onError: ({ error, runner }) => {
				const isQuestionCreated = currentSurveyStore.survey?.questions.at(generatedQuestionIndex);
				if (isQuestionCreated) {
					currentSurveyStore.survey?.questions?.splice(generatedQuestionIndex - 1, 1);
					currentSurveyStore.isDirty = false;
				}
				if (!runner?.aborted) {
					// Possible when error caused by something else rather than stream response
					runner?.abort();
				}
				// rethrow error to handle it in toast.promise
				throw error;
			}
		});
	};
</script>

<div class="relative w-full">
	<Popover.Root open={isPopoverOpen} onOpenChange={(val) => (isPopoverOpen = val)}>
		<Popover.Trigger disabled={currentSurveyStore.isGenerating} class="w-full">
			<Button
				disabled={currentSurveyStore.isGenerating}
				size="sm"
				variant="outline"
				class="relative flex w-full items-center justify-center gap-x-1 rounded-l-none"
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
