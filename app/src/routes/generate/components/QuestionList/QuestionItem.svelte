<script lang="ts">
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
	import cloneDeep from 'lodash.clonedeep';
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import { toast } from 'svelte-sonner';
	import { v4 as uuidv4 } from 'uuid';

	const {
		question
	}: {
		question: Question;
	} = $props();

	let isDialogOpen = $state(false);
	let isActionMenuOpen = $state(false);

	let updatedQuestion: Question = $state(cloneDeep(question));

	$effect(() => {
		if (!question || currentSurveyStore.isGenerating) return;
		console.log('updated');
		updatedQuestion = cloneDeep(question);
	});

	function onDelete() {
		if (!currentSurveyStore.survey || !currentSurveyStore.survey.questions) return;

		const qs = currentSurveyStore.survey.questions;
		const questionIndex = qs.findIndex((q) => q.id === question.id);

		if (questionIndex !== -1) {
			const question = qs[questionIndex];
			toast.success('Question deleted successfully!', {
				action: {
					label: 'Undo',
					onClick: () => {
						const currentQs = currentSurveyStore.survey!.questions;
						currentSurveyStore.survey!.questions = [
							...(currentQs ?? []).slice(0, questionIndex),
							question,
							...(currentQs ?? []).slice(questionIndex + 1)
						];
					}
				}
			});
			currentSurveyStore.survey.questions = qs.filter((q) => q.id !== question.id);
			currentSurveyStore.isDirty = true;
		} else {
			toast.warning('Internal error');
		}
	}

	function handleSave() {
		if (!currentSurveyStore.survey) return;
		currentSurveyStore.survey.questions = currentSurveyStore.survey.questions?.map((q) =>
			q.id === question.id
				? {
						...updatedQuestion,
						correctAnswer:
							updatedQuestion.answerType === AnswerTypes.TEXT ? updatedQuestion.correctAnswer : null
					}
				: q
		);
		isDialogOpen = false; // Close the dialog after saving
		currentSurveyStore.isDirty = true;
	}

	function deleteOption(index: number) {
		updatedQuestion.options.splice(index, 1);
	}

	function createOption() {
		updatedQuestion.options.push({
			id: uuidv4(),
			value: 'New option',
			isCorrect: false
		});
	}
</script>

<div class="group flex gap-x-6">
	<div class="w-full">
		<h3 class="mb-5 inline-flex w-full justify-between gap-x-2 text-xl font-medium">
			{question.question}
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
					<DialogTrigger disabled={currentSurveyStore.isGenerating}>
						<button
							disabled={currentSurveyStore.isGenerating}
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
								<Label class="inline-flex gap-x-0.5" for={`type-${question.id}`}>
									Answer type
									<Info size="10" />
								</Label>
								<RadioGroup.Root
									bind:value={updatedQuestion.answerType}
									class="mt-2 gap-x-2"
									id={`type-${question.id}`}
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
								<Label for={`question-${updatedQuestion.id}`} class="block">Question:</Label>
								<Input
									class="mt-2"
									id={`question-${updatedQuestion.id}`}
									bind:value={updatedQuestion.question}
								/>
							</div>
							{#if updatedQuestion.answerType === 'text'}
								<div>
									<Label for={`correct-answer-${updatedQuestion.id}`} class="block">
										Correct answer:
									</Label>
									<Input
										class="mt-2"
										id={`correct-answer-${updatedQuestion.id}`}
										bind:value={updatedQuestion.correctAnswer}
									/>
								</div>
							{:else}
								<div>
									<Label>Options</Label>
									{#each updatedQuestion.options as option, index}
										<div class="mt-2 flex items-center space-x-2">
											<Input
												type="text"
												id={`option-${updatedQuestion.id}-${index}`}
												bind:value={option.value}
												class="input flex-1"
											/>
											<Checkbox
												id={`checkbox-${updatedQuestion.id}-${index}`}
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
							<Button on:click={handleSave}>Save</Button>
							<Button variant="outline" on:click={() => (isDialogOpen = false)}>Cancel</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<button
					onclick={onDelete}
					class="text-destructive opacity-25 transition-opacity group-hover:opacity-25 group-hover:hover:opacity-75 lg:opacity-0"
				>
					<Trash2 size="16" />
				</button>
			</span>
		</h3>
		{#if question.answerType === 'single'}
			<RadioGroup.Root value="option-one">
				{#each question.options as option, index}
					<div class="flex items-center space-x-2">
						<RadioGroup.Item value={option.value} id={`radio-${question.id}-${index}`} />
						<Label for={`radio-${question.id}-${index}`}
							>{option.value}
							{#if option.isCorrect}
								<span class="text-green">✅</span>
							{/if}
						</Label>
					</div>
				{/each}
			</RadioGroup.Root>
		{:else if question.answerType === 'multiple'}
			{#each question.options as option, index}
				<div class="mt-2 flex items-center space-x-2">
					<Checkbox id={`checkbox-${question.id}-${index}`} />
					<Label for={`checkbox-${question.id}-${index}`}>
						{option.value}
						{#if option.isCorrect}
							<span class="text-green ml-2">✅</span>
						{/if}
					</Label>
				</div>
			{/each}
		{:else if question.answerType === 'text'}
			<Input type="text" class="mt-2 max-w-[400px]" />
			<span class="text-xs text-gray-500">Answer: {question.correctAnswer}</span>
		{/if}
	</div>
</div>
