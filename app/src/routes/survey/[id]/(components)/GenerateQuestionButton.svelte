<script lang="ts">
	import { Sparkles } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import * as Popover from '@/components/ui/popover';
	import { Input } from '@/components/ui/input';
	import { Label } from '@/components/ui/label';
	import { toast } from 'svelte-sonner';
	import type { GenerateQuestionDto } from '../../../api/survey/generate-question/+server';
	import { v4 } from 'uuid';
	import type { Question, QuestionCompletion, Survey } from '@/types/entities';
	import { streamOpenAiResponse } from '@/utils/openai-stream';
	import { currentSurvey } from '@/stores/survey-details.svelte';

	let isPopoverOpen = $state(false);
	let questionTopic = $state('');

	const onGenerate = async () => {
		if (currentSurvey.isGenerating) {
			toast.error('Already generating a question');
			return;
		}

		const existingQuestions = currentSurvey.survey?.questions?.map((q) => q.question);
		if (!existingQuestions || !currentSurvey.survey?.id) {
			toast.error('Internal error: no existing survey');
			return;
		}

		const body: GenerateQuestionDto = {
			topic: questionTopic,
			existingQuestions,
			surveyId: currentSurvey.survey.id,
			surveyDifficulty: currentSurvey.survey.difficulty,
			surveyTitle: currentSurvey.survey.title
		};

		let optionsIds: string[] = [];

		let newQuestion = {
			id: v4(),
			question: '',
			answerType: '',
			correctAnswer: '',
			options: []
		} as Question;

		currentSurvey.survey.questions?.push(newQuestion);
		const generatedQuestionIndex = (currentSurvey.survey?.questions.length ?? 1) - 1;

		currentSurvey.isGenerating = true;
		await streamOpenAiResponse<Partial<QuestionCompletion>, QuestionCompletion>({
			endpoint: '/api/survey/generate-question',
			body,
			onPartial: (partialData) => {
				if (partialData.options?.length && partialData.options?.length > optionsIds.length) {
					optionsIds.push(v4());
				}
				if (currentSurvey.survey?.questions[generatedQuestionIndex]) {
					currentSurvey.survey.questions[generatedQuestionIndex] = {
						...newQuestion,
						...partialData,
						options:
							partialData.options?.map((option, index) => ({
								...option,
								id: optionsIds[index]
							})) ?? []
					};
					currentSurvey.isDirty = true;
				}
			},
			onComplete: (finalData) => {
				const questionIndex = (currentSurvey.survey?.questions.length ?? 0) - 1;
				if (questionIndex < 0) {
					return;
				}
				const question = finalData;

				if (currentSurvey.survey?.questions[questionIndex]) {
					currentSurvey.survey.questions[questionIndex] = {
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
				currentSurvey.isDirty = true;
				currentSurvey.isGenerating = false;
			},
			onError: (error) => {
				const isQuestionCreated = currentSurvey.survey?.questions.at(generatedQuestionIndex);
				if (isQuestionCreated) {
					currentSurvey.survey?.questions?.splice(generatedQuestionIndex - 1, 1);
					currentSurvey.isDirty = false;
				}
				// rethrow error to handle it in toast.promise
				throw error;
			}
		});
	};
</script>

<div class="relative w-full">
	<Popover.Root open={isPopoverOpen} onOpenChange={(val) => (isPopoverOpen = val)}>
		<Popover.Trigger disabled={currentSurvey.isGenerating} class="w-full">
			<Button
				disabled={currentSurvey.isGenerating}
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
			<Input disabled={currentSurvey.isGenerating} bind:value={questionTopic} class="mt-1.5" />
			<Button
				onclick={onGenerate}
				disabled={currentSurvey.isGenerating}
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
