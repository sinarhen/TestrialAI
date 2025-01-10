<script lang="ts">
	import { type QuestionState, questionState } from '../../../../../types';
	import { toast } from 'svelte-sonner';
	import { createQuestion, updateQuestion } from '@/actions';
	import {
		Dialog,
		DialogContent,
		DialogTrigger,
		DialogHeader,
		DialogFooter,
		DialogTitle,
		DialogDescription
	} from '@/components/ui/dialog';
	import * as RadioGroup from '@/components/ui/radio-group';

	import { AnswerTypes, type Question } from '@/types/entities';
	import lodash from 'lodash';
	import { Info, Pencil, Plus, Trash2 } from 'lucide-svelte';
	import { Label } from '@/components/ui/label';
	import { Input } from '@/components/ui/input';
	import { Checkbox } from '@/components/ui/checkbox';
	import { Button } from '@/components/ui/button';

	const {
		surveyId,
		question,
		updateQuestionInStore
	}: {
		surveyId: string;
		question: QuestionState;
		updateQuestionInStore: (updatedQuestion: Question, isJustGenerated?: boolean) => void;
	} = $props();

	let updatedQuestion = $state(lodash.cloneDeep(question));

	let isDialogOpen = $state(false);

	$effect(() => {
		if (lodash.isEqual(question, updatedQuestion) || questionState.isNew(question)) return;
		updatedQuestion.status = 'modified';
	});

	function deleteOption(index: number) {
		updatedQuestion.options?.splice(index, 1);
	}

	function createOption() {
		if (!questionState.isEditable(updatedQuestion)) return;
		updatedQuestion.options = [
			...(updatedQuestion.options ?? []),
			{
				value: '',
				isCorrect: false
			}
		];
	}
	const onEditApply = async () => {
		// Didn't change anything
		if (questionState.isSaved(updatedQuestion)) {
			toast.success('Question had no changes to save');
			isDialogOpen = false;
			return;
		} else if (!questionState.isEditable(updatedQuestion)) {
			console.error('Invalid question status');
			toast.error('You cannot save this question');
			return;
		} else if (questionState.isGenerating(updatedQuestion)) {
			return;
		}

		const resp = questionState.isNew(updatedQuestion)
			? createQuestion(surveyId, updatedQuestion)
			: updateQuestion(surveyId, updatedQuestion);

		toast.promise(resp, {
			loading: 'Saving question...',
			success: ({ data }) => {
				updateQuestionInStore(data, questionState.isNew(updatedQuestion));
				isDialogOpen = false;
				return 'Question saved successfully';
			},
			error: (e) => {
				console.error(e);
				return 'Failed to save question';
			}
		});
	};
</script>

{#if questionState.isEditable(updatedQuestion)}
	<Dialog
		open={isDialogOpen}
		onOpenChange={() => {
			isDialogOpen = !isDialogOpen;
		}}
	>
		<DialogTrigger>
			<button
				class="opacity-25 transition-opacity hover:opacity-75 group-hover:opacity-25 group-hover:hover:opacity-100 lg:opacity-0"
				onclick={() => (isDialogOpen = true)}
			>
				<Pencil size="16" />
			</button>
		</DialogTrigger>
		<DialogContent>
			<DialogHeader>
				<DialogTitle>Edit Question</DialogTitle>
				<DialogDescription>Modify the details of the question below.</DialogDescription>
			</DialogHeader>
			<div class="space-y-6">
				<div>
					<Label class="inline-flex gap-x-0.5" for={`answer-type`}>
						Answer type
						<Info size="10" />
					</Label>
					<RadioGroup.Root
						disabled={questionState.isGenerating(updatedQuestion)}
						bind:value={updatedQuestion.answerType}
						class="mt-2 gap-x-2"
						id={`answer-type`}
					>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value={AnswerTypes.SINGLE} id="single" />
							<Label for="single">Single</Label>
						</div>
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value={AnswerTypes.MULTIPLE} id="multiple" />
							<Label for="multiple">Multiple</Label>
						</div>
						<div class="items center flex space-x-2">
							<RadioGroup.Item value={AnswerTypes.TEXT} id="text" />
							<Label for="text">Text</Label>
						</div>
					</RadioGroup.Root>
				</div>
				<div>
					<Label for={`question-edit`} class="block">Question:</Label>
					<Input class="mt-2" id={`question-edit`} bind:value={updatedQuestion.question} />
				</div>
				{#if updatedQuestion.answerType === 'text'}
					<div>
						<Label for={`correct-answer-edit`} class="block">Correct answer:</Label>
						<Input
							class="mt-2"
							id={`correct-answer-edit`}
							bind:value={updatedQuestion.correctAnswer}
						/>
					</div>
				{:else}
					<div>
						<Label>Options</Label>
						{#each updatedQuestion.options ?? [] as option, index}
							<div class="mt-2 flex items-center space-x-2">
								<Input type="text" bind:value={option.value} class="input flex-1" />
								<Checkbox
									id={`checkbox-${updatedQuestion}-${index}`}
									bind:checked={option.isCorrect}
								/>
								<Trash2
									onclick={() => deleteOption(index)}
									class="text-destructive cursor-pointer"
									size="16"
								/>
							</div>
						{/each}
						<Button onclick={createOption} class="mt-2 w-full" variant="link"
							><Plus size="16" />Add new</Button
						>
					</div>
				{/if}
			</div>
			<DialogFooter class="gap-y-2">
				<Button onclick={onEditApply}>Save</Button>
				<Button variant="outline" on:click={() => (isDialogOpen = false)}>Cancel</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
{/if}
