<script lang="ts">
	import { Sparkles, Square } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import * as Popover from '@/components/ui/popover';
	import { Input } from '@/components/ui/input';
	import { Label } from '@/components/ui/label';
	import { toast } from 'svelte-sonner';
	import type { GeneratingQuestionCompletion, QuestionCompletion } from '@/types/entities';
	import { streamOpenAiResponse } from '@/utils/openai-stream';
	import type { GenerateQuestionDto } from '../../../api/surveys/[surveyId]/questions/generate/+server';
	import type { SurveyState } from '../types';

	let isPopoverOpen = $state(false);
	let questionTopic = $state('');

	let abortController: AbortController | null = null;

	const {
		survey = $bindable()
	}: {
		survey: SurveyState;
	} = $props();

	function resetPopover() {
		isPopoverOpen = false;
		questionTopic = '';
	}

	let generatingQuestionIndex: number | null = $state(null);

	async function onGenerate() {
		// Prepare request body
		const body: GenerateQuestionDto = {
			topic: questionTopic
		};

		// Create a fresh AbortController for this generation
		abortController = new AbortController();

		survey?.questions?.push({
			status: 'generating'
		});
		generatingQuestionIndex = survey?.questions.length - 1;

		resetPopover();

		try {
			await streamOpenAiResponse<GeneratingQuestionCompletion, QuestionCompletion>({
				endpoint: `/api/surveys/${survey.id}/questions/generate`,
				body,
				signal: abortController.signal,

				onPartial: (partialData) => {
					if (!generatingQuestionIndex) return;
					survey?.questions.splice(generatingQuestionIndex, 1, {
						...partialData,
						status: 'generating'
					});
				},

				onComplete: (finalData) => {
					if (!generatingQuestionIndex) return;

					survey?.questions.splice(generatingQuestionIndex, 1, {
						...finalData,
						status: 'generated'
					});

					toast.success('Question is generated, does it look good for you?');
				}
			});
		} catch (error) {
			console.error('Question generation failed:', error);

			// If a placeholder question was indeed added, remove it
			if (survey?.questions[generatingQuestionIndex]) {
				survey.questions.splice(generatingQuestionIndex, 1);
			}

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
		const lastIndex = (survey?.questions.length ?? 0) - 1;
		survey?.questions.splice(lastIndex, 1);

		toast.success('Generating question canceled');
	}
</script>

<div class="relative w-full">
	<Popover.Root bind:open={isPopoverOpen}>
		<Popover.Trigger class="w-full">
			<Button
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

			<Input bind:value={questionTopic} class="mt-1.5" />

			<Button
				disabled={!questionTopic}
				onclick={onGenerate}
				variant="default"
				size="sm"
				class="mt-2 gap-x-1"
			>
				Generate
			</Button>

			<Button
				disabled={!generatingQuestionIndex ||
					survey.questions.at(generatingQuestionIndex)?.status !== 'generating'}
				onclick={onCancelGenerate}
				variant="ghost"
				size="icon"
				class="mt-2"
			>
				<Square size="16" />
			</Button>
		</Popover.Content>
	</Popover.Root>
</div>
