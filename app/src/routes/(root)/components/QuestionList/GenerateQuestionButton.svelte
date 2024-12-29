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
	import type { Question } from '@/types/entities';
	import { parse } from 'partial-json';

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
			surveyId: currentSurveyStore.survey?.id
		};
		fetch('/generate-question', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(body)
		})
			.then(async (res) => {
				if (res.ok && res.body) {
					const runner = ChatCompletionStream.fromReadableStream(res.body);
					const newQuestionTempId = v4();

					currentSurveyStore.survey?.questions?.push({
						id: newQuestionTempId,
						correctAnswer: null,
						options: [],
						question: '',
						answerType: ''
					});

					function updateQuestionById(question: Question) {
						const index = currentSurveyStore.survey?.questions?.findIndex(
							(q) => q.id === newQuestionTempId
						);
						if (index && index !== -1 && currentSurveyStore.survey?.questions?.[index]) {
						}
					}
					runner.on('content.delta', ({ snapshot }) => updateQuestionById(parse(snapshot)));
					runner.on('content.done', ({ content }) => {
						updateQuestionById(parse(content));
						toast.success('Successfully generated a question');
					});
				} else {
					throw new Error(res.statusText);
				}
			})
			.catch((e) => {
				console.error(e);
				toast.error('Failed to generate a question');
			})
			.finally(() => {
				currentSurveyStore.isGenerating = false;
				isPopoverOpen = false;
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
