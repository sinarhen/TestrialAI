<script lang="ts">
	import { Sparkles, Square } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import * as Popover from '@/components/ui/popover';
	import { Input } from '@/components/ui/input';
	import { Label } from '@/components/ui/label';
	import { toast } from 'svelte-sonner';
	import { v4 } from 'uuid';
	import type {
		GeneratingQuestionCompletion,
		Question,
		QuestionCompletion,
		Survey
	} from '@/types/entities';
	import { streamOpenAiResponse } from '@/utils/openai-stream';
	import { currentSurvey } from '@/stores/survey-details.svelte';
	import type { GenerateQuestionDto } from '../../../api/surveys/[surveyId]/questions/generate/+server';
	import { createQuestion, updateQuestion } from '@/actions';
	import { invalidate } from '$app/navigation';

	let isPopoverOpen = $state(false);
	let questionTopic = $state('');

	let abortController: AbortController | null = null;

	function resetPopover() {
		isPopoverOpen = false;
		questionTopic = '';
	}

	async function onGenerate() {
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
			topic: questionTopic
		};

		// Create a fresh AbortController for this generation
		abortController = new AbortController();

		currentSurvey.survey?.questions?.push({
			isGenerating: true
		});
		const generatedQuestionIndex = currentSurvey.survey?.questions.length - 1;

		currentSurvey.isGenerating = true;
		resetPopover();

		try {
			await streamOpenAiResponse<Partial<QuestionCompletion>, QuestionCompletion>({
				endpoint: `/api/surveys/${currentSurvey.survey.id}/questions/generate`,
				body,
				signal: abortController.signal,

				onPartial: (partialData) => {
					currentSurvey.survey?.questions.splice(generatedQuestionIndex, 1, {
						...partialData,
						isGenerating: true
					});
				},

				onComplete: (finalData) => {
					if (!currentSurvey.survey?.id) return;
					toast.promise(createQuestion(currentSurvey.survey?.id, finalData), {
						loading: 'Saving question...',
						success: ({ data }) => {
							currentSurvey.survey?.questions.splice(generatedQuestionIndex, 1, {
								...data
							});
							currentSurvey.isGenerating = false;
							invalidate(`/survey/${currentSurvey.survey?.id}`);
							return 'Question saved successfully';
						},
						error: (error) => {
							console.error('Failed to save generated question:', error);
							currentSurvey.survey?.questions.splice(generatedQuestionIndex, 1);
							currentSurvey.isGenerating = false;
							return 'Failed to save generated question';
						}
					});
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
