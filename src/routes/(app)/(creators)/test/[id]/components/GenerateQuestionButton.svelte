<script lang="ts">
	import { Sparkles, Square } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import * as Popover from '@/components/ui/popover';
	import { Input } from '@/components/ui/input';
	import { Label } from '@/components/ui/label';
	import { toast } from 'svelte-sonner';
	import type { TestState } from '../types';
	import type { GenerateQuestionParamsDto } from '@/server/api/questions/dtos/generate-question-params.dto';
	import { streamOpenAiResponse } from '@/client/utils/openai-stream';
	import { api } from '@/client/api';
	import { type GeneratedQuestionDto } from '@/server/api/questions/dtos/question.dto';

	let isPopoverOpen = $state(false);
	let questionTopic = $state('');

	let abortController: AbortController | null = null;

	const {
		test = $bindable()
	}: {
		test: TestState;
	} = $props();

	function resetPopover() {
		isPopoverOpen = false;
		questionTopic = '';
	}

	let generatingQuestionIndex: number | null = $state(null);

	async function onGenerate() {
		abortController = new AbortController();

		test?.questions?.push({
			status: 'generating'
		});
		generatingQuestionIndex = test?.questions.length - 1;

		resetPopover();
		const generateEndpoint = api().questions[':testId'].questions.generate;
		const generateEndpointUrl = generateEndpoint
			.$url({
				param: {
					testId: test.id
				}
			})
			.toString();

		type GenerateEndpointBody = Parameters<(typeof generateEndpoint)['$post']>['0']['json'];
		try {
			await streamOpenAiResponse<GeneratedQuestionDto>({
				endpoint: generateEndpointUrl,
				body: {
					topic: questionTopic
				} as GenerateEndpointBody,
				signal: abortController.signal,
				onPartial: (partialData) => {
					if (!generatingQuestionIndex) return;
					test?.questions.splice(generatingQuestionIndex, 1, {
						...partialData,
						status: 'generating'
					});
				},
				onComplete: (finalData) => {
					if (!generatingQuestionIndex) return;
					test?.questions.splice(generatingQuestionIndex, 1, {
						...finalData,
						status: 'generated'
					});
					console.log('Question generated:', finalData);
					toast.success('Question is generated, does it look good for you?');
				},
				onError: (error) => {
					if (error instanceof Error) {
						console.error('Question generation failed:', error);
						toast.error(error.message);
					} else {
						console.error('Question generation failed:', error);
					}

					if (!generatingQuestionIndex) return;

					if (test?.questions[generatingQuestionIndex]) {
						test.questions.splice(generatingQuestionIndex, 1);
					}
				}
			});
		} catch (error) {
			console.error('Question generation failed:', error);

			// If a placeholder question was indeed added, remove it
			if (test?.questions[generatingQuestionIndex]) {
				test.questions.splice(generatingQuestionIndex, 1);
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
		const lastIndex = (test?.questions.length ?? 0) - 1;
		test?.questions.splice(lastIndex, 1);

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
					test.questions.at(generatingQuestionIndex)?.status !== 'generating'}
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
