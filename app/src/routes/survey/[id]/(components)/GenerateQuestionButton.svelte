<script lang="ts">
	import { Sparkles, Square } from 'lucide-svelte';
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

	let abortController: AbortController | null = null;

	function resetPopover() {
		isPopoverOpen = false;
		questionTopic = '';
	}

	async function onGenerate() {
		// prevent overlapping generation
		if (currentSurvey.isGenerating) {
			toast.error('Already generating a question');
			return;
		}
		if (!currentSurvey.survey) {
			toast.error('Internal error: no current survey');
			return;
		}
		const existingQuestions = currentSurvey.survey?.questions?.map((q) => q.question);
		const surveyId = currentSurvey.survey?.id;

		if (!existingQuestions || !surveyId) {
			toast.error('Internal error: no existing survey');
			return;
		}

		// Prepare request body
		const body: GenerateQuestionDto = {
			topic: questionTopic,
			existingQuestions,
			surveyId,
			surveyDifficulty: currentSurvey.survey.difficulty,
			surveyTitle: currentSurvey.survey.title
		};

		// Create a fresh AbortController for this generation
		abortController = new AbortController();

		// Prepare a placeholder question
		const newQuestion: Question = {
			id: v4(),
			question: '',
			answerType: '',
			correctAnswer: '',
			options: []
		};

		// Push placeholder question so we can visually see partial data
		currentSurvey.survey?.questions?.push(newQuestion);
		const generatedQuestionIndex = currentSurvey.survey?.questions.length - 1;

		currentSurvey.isGenerating = true;
		let optionsIds: string[] = [];

		try {
			await streamOpenAiResponse<Partial<QuestionCompletion>, QuestionCompletion>({
				endpoint: '/api/survey/generate-question',
				body,
				signal: abortController.signal,

				onPartial: (partialData) => {
					if (!currentSurvey.survey) return;
					// If new options arrived, generate new IDs for them
					if (partialData.options?.length && partialData.options.length > optionsIds.length) {
						optionsIds.push(v4());
					}
					// Update the question in place with partial data
					const existingQuestion = currentSurvey.survey.questions[generatedQuestionIndex];
					if (existingQuestion) {
						currentSurvey.survey.questions[generatedQuestionIndex] = {
							...existingQuestion,
							...partialData,
							options:
								partialData.options?.map((opt, idx) => ({
									...opt,
									id: optionsIds[idx]
								})) ?? []
						};
						currentSurvey.isDirty = true;
					}
				},

				onComplete: (finalData) => {
					// Update question with final data
					if (!currentSurvey.survey) return;
					const existingQuestion = currentSurvey.survey.questions[generatedQuestionIndex];
					if (!existingQuestion) return;

					currentSurvey.survey.questions[generatedQuestionIndex] = {
						...existingQuestion,
						...finalData,
						options:
							finalData.options?.map((opt, idx) => ({
								...opt,
								id: optionsIds[idx]
							})) ?? []
					};

					currentSurvey.isDirty = true;
					currentSurvey.isGenerating = false;

					resetPopover();
				}
			});
		} catch (error) {
			console.error('Question generation failed:', error);

			// If a placeholder question was indeed added, remove it
			if (currentSurvey.survey?.questions[generatedQuestionIndex]) {
				currentSurvey.survey.questions.splice(generatedQuestionIndex, 1);
			}
			// Mark as not generating so user can retry
			currentSurvey.isGenerating = false;
			currentSurvey.isDirty = false;

			// If not aborted programmatically, show an error
			if (!abortController?.signal.aborted) {
				toast.error('Failed to generate a question');
			}
		} finally {
			// Always clean up the abort controller
			abortController = null;
		}
	}

	function onCancelGenerate() {
		// If we’re in the midst of generating, abort the request
		if (abortController) {
			abortController.abort();
		}

		// If the question was already appended, remove it
		if (currentSurvey.isGenerating) {
			const lastIndex = (currentSurvey.survey?.questions.length ?? 0) - 1;
			currentSurvey.survey?.questions.splice(lastIndex, 1);
			currentSurvey.isGenerating = false;
			currentSurvey.isDirty = false;
		}

		toast.success('Generating question canceled');
	}
</script>

<div class="relative w-full">
	<Popover.Root bind:open={isPopoverOpen}>
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

			<Input bind:value={questionTopic} disabled={currentSurvey.isGenerating} class="mt-1.5" />

			<Button
				onclick={onGenerate}
				disabled={currentSurvey.isGenerating}
				variant="default"
				size="sm"
				class="mt-2 gap-x-1"
			>
				<Sparkles size="16" />
				Generate
			</Button>

			<Button
				onclick={onCancelGenerate}
				disabled={!currentSurvey.isGenerating}
				variant="ghost"
				size="icon"
				class="mt-2"
			>
				<Square size="16" />
			</Button>
		</Popover.Content>
	</Popover.Root>
</div>
