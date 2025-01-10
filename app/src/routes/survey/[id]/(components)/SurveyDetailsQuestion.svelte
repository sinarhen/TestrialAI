<script lang="ts">
	import lodash from 'lodash';
	import {
		Brain,
		CaseLower,
		ChevronDown,
		Globe,
		Info,
		Pencil,
		Plus,
		RotateCw,
		Sparkles,
		Trash2
	} from 'lucide-svelte';
	import { Label } from '@/components/ui/label';
	import * as RadioGroup from '@/components/ui/radio-group';
	import { Checkbox } from '@/components/ui/checkbox';
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import {
		Dialog,
		DialogContent,
		DialogTrigger,
		DialogHeader,
		DialogFooter,
		DialogTitle,
		DialogDescription
	} from '@/components/ui/dialog';
	import { Button } from '@/components/ui/button';
	import { AnswerTypes, type Question } from '@/types/entities';
	import { Input } from '@/components/ui/input';
	import { questionState, type QuestionState } from '../types';
	import { toast } from 'svelte-sonner';
	import { createQuestion, deleteQuestion, updateQuestion } from '@/actions';

	const {
		surveyId,
		question,
		updateQuestionInStore,
		deleteQuestionInStore
	}: {
		surveyId: string;
		question: QuestionState;
		updateQuestionInStore: (updatedQuestion: Question, isJustGenerated?: boolean) => void;
		deleteQuestionInStore: () => void;
	} = $props();

	$effect(() => {
		if (lodash.isEqual(question, updatedQuestion)) return;
		updatedQuestion.status = 'modified';
	});

	let isDialogOpen = $state(false);
	let isActionMenuOpen = $state(false);
	let updatedQuestion = $state(lodash.cloneDeep(question));

	function deleteOption(index: number) {
		updatedQuestion.options?.splice(index, 1);
	}

	function createOption() {
		if (!questionState.isEditable(updatedQuestion)) return;
		const newOptions = [
			...(updatedQuestion.options ?? []),
			{
				value: '',
				isCorrect: false
			}
		];
		if (updatedQuestion.status === 'new') {
			updatedQuestion = {
				...updatedQuestion,
				options: newOptions
			};
		} else {
			updatedQuestion = {
				...updatedQuestion,
				status: 'modified',
				options: newOptions
			};
		}
	}

	const onQuestionDelete = async () => {
		if (updatedQuestion.status === 'new') {
			// If the question is new, we can just remove it from the store without making any changes to the server
			// Question that has some changes applied is saved to the server immediately and becomes 'ready'
			deleteQuestionInStore();
			return;
		}

		let isCanceled = false;

		toast.success('Question will be deleted in 5 seconds', {
			duration: 5000,
			onAutoClose: () => {
				if (isCanceled) return;

				if (!questionState.isExisting(updatedQuestion)) {
					toast.warning('Unable to delete question');
					return;
				}

				toast.promise(deleteQuestion(surveyId, updatedQuestion.id), {
					loading: 'Deleting question...',
					success: () => {
						deleteQuestionInStore();
						return 'Question is deleted successfully';
					},
					error: (err) => {
						console.error(err);
						return 'Failed to delete question';
					}
				});
			},
			action: {
				label: 'Cancel',
				onClick: () => {
					isCanceled = true;
					toast.success("Question won't be deleted");
				}
			}
		});
	};

	const onEditApply = async () => {
		// Didn't change anything
		if (questionState.isReady(updatedQuestion)) {
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

	const onQuestionApprove = async () => {
		if (question.status !== 'generated') {
			throw new Error('Invalid question status');
		}
		toast.promise(createQuestion(surveyId, question), {
			loading: 'Saving question...',
			success: ({ data }) => {
				updateQuestionInStore(data, true);
				return 'Question saved successfully';
			},
			error: (error) => {
				console.error('Failed to save generated question:', error);
				deleteQuestionInStore();
				return 'Failed to save generated question';
			}
		});
	};

	const onQuestionReject = async () => {
		if (question.status !== 'generated') {
			throw new Error('Invalid question status');
		}
		deleteQuestionInStore();
		toast.success('Question is rejected. Try generating a new one 😊');
	};

	const isGenerating = $derived(questionState.isGenerating(updatedQuestion));
	const isGenerated = $derived(questionState.isGenerated(updatedQuestion));
</script>

<div class="group">
	{#if isGenerated}
		<span
			class="motion-opacity-in-0 motion-delay-150 motion-preset-shrink inline-flex items-center gap-x-0.5 rounded-md border bg-black p-1 text-xs text-white"
		>
			<Sparkles size="12" /> Finished
		</span>
	{/if}
	{#if isGenerating}
		<span
			class="motion-opacity-in-0 motion-delay-150 motion-preset-shrink inline-flex items-center gap-x-0.5 rounded-md border bg-black p-1 text-xs text-white"
		>
			<Sparkles size="12" /> Generating
		</span>
	{/if}
	<div class:animate-pulse={isGenerating} class="w-full">
		<h3 class="mb-5 inline-flex w-full justify-between gap-x-2 text-xl font-medium">
			{question.question}
			{#if questionState.isEditable(updatedQuestion)}
				<span class="flex h-full items-center gap-x-2">
					<DropdownMenu.Root
						closeOnItemClick={true}
						open={isActionMenuOpen}
						onOpenChange={() => (isActionMenuOpen = !isActionMenuOpen)}
					>
						<DropdownMenu.Trigger
							class="inline-flex cursor-pointer items-center opacity-25 transition-opacity hover:opacity-75 group-hover:opacity-25 group-hover:hover:opacity-100 lg:opacity-0"
						>
							<Sparkles size="16" />
							<ChevronDown size="12" />
						</DropdownMenu.Trigger>
						<DropdownMenu.Content class="relative w-[200px]">
							<DropdownMenu.Group>
								<DropdownMenu.Label>Actions</DropdownMenu.Label>
								<DropdownMenu.Separator />
								<DropdownMenu.Item class="cursor-pointer"
									><RotateCw size="16" class="mr-2" /> Rephrase</DropdownMenu.Item
								>
								<DropdownMenu.Item class="cursor-pointer"
									><Brain size="16" class="mr-2" /> Harder</DropdownMenu.Item
								>
								<DropdownMenu.Item class="cursor-pointer"
									><CaseLower size="16" class="mr-2" />Simplify</DropdownMenu.Item
								>
								<DropdownMenu.Item class="cursor-pointer"
									><Globe size="16" class="mr-2" />Translate</DropdownMenu.Item
								>
							</DropdownMenu.Group>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
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
										disabled={isGenerating}
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
					<button
						onclick={onQuestionDelete}
						class="text-destructive opacity-25 transition-opacity group-hover:opacity-25 group-hover:hover:opacity-75 lg:opacity-0"
					>
						<Trash2 size="16" />
					</button>
				</span>
			{/if}
		</h3>
		{#if question.answerType === 'single'}
			<RadioGroup.Root disabled={isGenerating} value="option-one">
				{#if question.options}
					{#each question.options as option, index}
						<div class="flex items-center space-x-2">
							<RadioGroup.Item value={option?.value ?? 'No value'} />
							<Label for={`radio-${question.question}-${index}`}
								>{option?.value}
								{#if option?.isCorrect}
									<span class="text-green">✅</span>
								{/if}
							</Label>
						</div>
					{/each}
				{/if}
			</RadioGroup.Root>
		{:else if question.answerType === 'multiple'}
			{#if question.options}
				{#each question.options as option, index}
					<div class="mt-2 flex items-center space-x-2">
						<Checkbox disabled={isGenerating} id={`checkbox-${question.question}-${index}`} />
						<Label for={`checkbox-${question.question}-${index}`}>
							{option?.value}
							{#if option?.isCorrect}
								<span class="text-green ml-2">✅</span>
							{/if}
						</Label>
					</div>
				{/each}
			{/if}
		{:else if question.answerType === 'text'}
			<Input disabled={isGenerating} type="text" class="mt-2 max-w-[400px]" />
			<span class="text-xs text-gray-500">Answer: {question.correctAnswer}</span>
		{/if}
	</div>
	{#if question.status === 'generated'}
		<div class="motion-opacity-in-0 mt-5 flex gap-x-2 duration-200">
			<Button onclick={onQuestionApprove} variant="default" size="sm" class="gap-x-1 text-xs">
				<Sparkles size="12" />
				Approve
			</Button>
			<Button onclick={onQuestionReject} variant="outline" class="gap-x-1 text-xs" size="sm">
				<Trash2 size="12" />
				Reject
			</Button>
		</div>
	{/if}
</div>
