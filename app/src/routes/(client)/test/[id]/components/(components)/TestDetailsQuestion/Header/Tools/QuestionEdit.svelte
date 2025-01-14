<script lang="ts">
	import { type QuestionState, questionState } from '../../../../../types';
	import { toast } from 'svelte-sonner';
	import { createQuestion, updateQuestion } from '@/services/handlers';
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

	import { AnswerTypes, supportedLangs, type SupportedLanguage } from '@/types/entities';
	import lodash from 'lodash';
	import { Info, Pencil, Plus, Trash2 } from 'lucide-svelte';
	import { Label } from '@/components/ui/label';
	import { Input } from '@/components/ui/input';
	import { Checkbox } from '@/components/ui/checkbox';
	import { Button } from '@/components/ui/button';
	import Textarea from '@/components/ui/textarea/textarea.svelte';
	import { getHljsWithLanguage } from '@/utils/code-parser';
	import * as Select from '@/components/ui/select';
	import QuestionCodeBlock from '../../../../QuestionCodeBlock.svelte';

	const {
		testId,
		question,
		updateQuestionInStore
	}: {
		testId: string;
		question: QuestionState;
		updateQuestionInStore: (updatedQuestion: QuestionState) => void;
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
			? createQuestion(testId, updatedQuestion)
			: updateQuestion(testId, updatedQuestion);

		toast.promise(resp, {
			loading: 'Saving question...',
			success: ({ data }) => {
				updateQuestionInStore({ ...data, status: 'saved' });
				isDialogOpen = false;
				return 'Question saved successfully';
			},
			error: (e) => {
				console.error(e);
				return 'Failed to save question';
			}
		});
	};

	let codeBlockEnabled = $state<boolean>(!!question.codeBlock);

	const languagesAvailable = supportedLangs.map((lang) => ({
		value: lang,
		label: lang
	}));
</script>

{#if questionState.isEditable(updatedQuestion)}
	<Dialog
		open={true}
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
		<DialogContent class="md:min-w-lg w-[85%] max-w-3xl">
			<DialogHeader>
				<DialogTitle>Edit Question</DialogTitle>
				<DialogDescription>Modify the details of the question below.</DialogDescription>
			</DialogHeader>
			<div class="space-y-6">
				<div>
					<Label for={`question-edit`}>Question:</Label>
					<Input
						id={`question-edit`}
						class="mt-2 block max-w-[400px]"
						bind:value={updatedQuestion.question}
					/>
				</div>
				<div>
					<div class="flex items-center justify-between gap-x-1">
						<div class="flex items-center gap-x-2">
							<Checkbox bind:checked={codeBlockEnabled} />
							<Label>Code block</Label>
						</div>
						<div>
							<Select.Root
								items={languagesAvailable}
								onSelectedChange={(val) => {
									if (!val) return;
									updatedQuestion.codeLang = val.value as SupportedLanguage;
								}}
							>
								<Select.Trigger class=" w-[200px]">
									{updatedQuestion.codeLang ?? 'Select language'}
								</Select.Trigger>
								<Select.Content class="max-h-[220px] overflow-y-auto">
									{#each languagesAvailable as lang}
										<Select.Item value={lang.value}>{lang.label}</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
					</div>

					<div class="mt-1 flex gap-x-1">
						<Textarea class="hljs w-full" bind:value={updatedQuestion.codeBlock}>
							asdads
							<QuestionCodeBlock
								codeBlock={updatedQuestion.codeBlock}
								codeLanguage={updatedQuestion.codeLang}
							/>
						</Textarea>

						<QuestionCodeBlock
							codeBlock={updatedQuestion.codeBlock}
							codeLanguage={updatedQuestion.codeLang}
						/>
					</div>

					<div>
						<Label class="inline-flex gap-x-0.5" for={`answer-type`}>
							Answer type
							<Info size="10" />
						</Label>
						<RadioGroup.Root
							disabled={questionState.isGenerating(updatedQuestion)}
							bind:value={updatedQuestion.answerType}
							class="mt-2 flex gap-x-3"
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
			</div></DialogContent
		>
	</Dialog>
{/if}
