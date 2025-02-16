<script lang="ts">
	import { parseClientResponse } from '@/client/utils/api.js';
	import { type QuestionState, questionState, type SavedQuestion } from '../../../../../types';
	import { toast } from 'svelte-sonner';
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
	import * as Accordion from '@/components/ui/accordion';
	import lodash from 'lodash';
	import { Info, Pencil, Plus, Sparkles, Trash2 } from 'lucide-svelte';
	import { Label } from '@/components/ui/label';
	import { Input } from '@/components/ui/input';
	import { Checkbox } from '@/components/ui/checkbox';
	import { Button } from '@/components/ui/button';
	import Textarea from '@/components/ui/textarea/textarea.svelte';
	import * as Select from '@/components/ui/select';
	import QuestionCodeBlock from '../../../../QuestionCodeBlock.svelte';
	import { streamOpenAiResponse } from '@/client/utils/openai-stream';
	import { api } from '@/client/api';
	import type { GeneratedQuestionDto } from '@/server/api/questions/dtos/question.dto';
	import { AnswerTypes } from '@/shared/constants/question-answer-types';
	import {
		supportedLangs,
		type SupportedLanguage
	} from '@/shared/constants/supported-codeblock-langs';

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

	const onGenerateCodeBlock = async () => {
		if (!questionState.isEditable(updatedQuestion) || questionState.isNew(updatedQuestion)) {
			console.log(updatedQuestion.status);
			return;
		}
		if (!updatedQuestion.codeLang) {
			toast.error('Please select a language first');
			return;
		}

		toast.info('Generating code block...');
		try {
			const generateCodeBlockEndpointUrl = api()
				.questions[':testId'].questions[':questionId']['сode-block'].generate.$url({
					param: {
						testId: testId,
						questionId: updatedQuestion.id
					}
				})
				.toString();

			await streamOpenAiResponse<GeneratedQuestionDto>({
				endpoint: generateCodeBlockEndpointUrl,
				onPartial: (partialData) => {
					if (!partialData.codeBlock) return;
					if (!partialData.codeLang) return;

					updatedQuestion.codeBlock = partialData.codeBlock;
					updatedQuestion.codeLang = partialData.codeLang;
				},
				onComplete: (finalData) => {
					updatedQuestion.codeBlock = finalData.codeBlock;
					updatedQuestion.codeLang = finalData.codeLang;
					toast.success('Code block generated successfully');
				},
				onError: (error) => {
					console.error(error);
					toast.error('Failed to generate code block');
				}
			});
		} catch (e) {
			console.error(e);
			toast.error('Failed to generate code block');
		}
	};

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

		let resp;
		try {
			if (questionState.isNew(updatedQuestion))
				resp = await api()
					.questions[':testId'].questions.$post({
						param: {
							testId
						},
						json: updatedQuestion
					})
					.then(parseClientResponse);
			else {
				resp = await api()
					.questions[':testId'].questions[':questionId'].$put({
						param: {
							testId,
							questionId: updatedQuestion.id
						},
						json: updatedQuestion
					})
					.then(parseClientResponse);
			}
		} catch (e) {
			console.error(e);
			toast.error('Failed to save question');
			return;
		}

		updateQuestionInStore({ ...resp, status: 'saved' });
		isDialogOpen = false;
		toast.success('Question saved successfully');
	};

	const languagesAvailable = supportedLangs.map((lang) => ({
		value: lang,
		label: lang
	}));
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
		<DialogContent class="md:min-w-lg max-h-[95vh] w-[85%] max-w-3xl overflow-y-auto text-sm">
			<DialogHeader>
				<DialogTitle>Edit Question</DialogTitle>
				<DialogDescription>Modify the details of the question below.</DialogDescription>
			</DialogHeader>
			<div class="flex flex-col gap-y-6">
				<div>
					<Label for={`question-edit`}>Question:</Label>
					<Input
						id={`question-edit`}
						class="mt-2 block w-full"
						bind:value={updatedQuestion.question}
					/>
				</div>
				<div>
					<Label class="inline-flex gap-x-0.5 " for={`answer-type`}>
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

				<div>
					<Accordion.Root>
						<Accordion.Item value="something">
							{#if updatedQuestion.answerType === 'text'}
								<Accordion.Trigger>Correct answer</Accordion.Trigger>
								<Accordion.Content>
									<Input
										class="mt-2"
										id={`correct-answer-edit`}
										bind:value={updatedQuestion.correctAnswer}
									/>
								</Accordion.Content>
							{:else}
								<Accordion.Trigger>Options</Accordion.Trigger>
								<Accordion.Content>
									{#each updatedQuestion.options ?? [] as option, index}
										<div class="mt-2 flex items-center space-x-2">
											<Input type="text" bind:value={option.value} class="input flex-1" />
											<Checkbox
												id={`checkbox-${updatedQuestion}-${index}`}
												bind:checked={option.isCorrect}
											/>
											<Trash2
												onclick={() => deleteOption(index)}
												class="cursor-pointer text-destructive"
												size="16"
											/>
										</div>
									{/each}

									<Button onclick={createOption} class="mt-2 w-full text-xs" variant="link"
										><Plus size="16" />Add new</Button
									>
								</Accordion.Content>
							{/if}
						</Accordion.Item>
						<Accordion.Item value="additional" class="border-0">
							<Accordion.Trigger class="border-0 opacity-50">Advanced settings</Accordion.Trigger>
							<Accordion.Content class="overflow-hidden">
								<div class="flex flex-col gap-y-6">
									<div>
										<div class="flex items-center justify-between gap-x-1">
											<div class="flex items-center gap-x-2">
												<Label class="flex gap-x-1 text-xs"
													>Code block
													<Info size="12" />
												</Label>
											</div>
											<div>
												<Select.Root
													items={languagesAvailable}
													onSelectedChange={(val) => {
														if (!val) return;
														updatedQuestion.codeLang = val.value as SupportedLanguage;
													}}
												>
													<Select.Trigger class="h-9 w-[200px] text-xs">
														{updatedQuestion.codeLang ?? 'Select language'}
													</Select.Trigger>
													<Select.Content class="max-h-[220px] overflow-y-auto text-xs">
														{#each languagesAvailable as lang}
															<Select.Item class="text-xs" value={lang.value}
																>{lang.label}</Select.Item
															>
														{/each}
													</Select.Content>
												</Select.Root>
											</div>
										</div>

										<div class="mt-1 flex w-full gap-x-1 text-xs">
											<div class="relative flex w-full">
												<Textarea
													class="flex w-full p-4 font-mono text-xs focus-visible:ring-0"
													bind:value={updatedQuestion.codeBlock}
												/>
												<Button
													onclick={onGenerateCodeBlock}
													size="icon"
													variant="ghost"
													class="absolute right-1 top-1 size-7 "
												>
													<Sparkles size="12" />
												</Button>
											</div>

											<QuestionCodeBlock
												isGenerating={questionState.isGenerating(updatedQuestion)}
												codeBlock={updatedQuestion.codeBlock}
												codeLanguage={updatedQuestion.codeLang}
											/>
										</div>
									</div>
									<div>
										<Label class="flex gap-x-1 text-xs"
											>Answer explanation
											<Info size="12" />
										</Label>
										<div class="relative mt-1 flex w-full">
											<Textarea
												bind:value={updatedQuestion.answerExplanation}
												class="flex w-full p-4 text-xs focus-visible:ring-0"
											/>
											<Button size="icon" variant="ghost" class="absolute right-1 top-1 size-7 ">
												<Sparkles size="12" />
											</Button>
										</div>
									</div>
								</div>
							</Accordion.Content>
						</Accordion.Item>
					</Accordion.Root>
				</div>
			</div>
			<DialogFooter class="gap-y-2">
				<Button onclick={onEditApply}>Save</Button>
				<Button variant="outline" on:click={() => (isDialogOpen = false)}>Cancel</Button>
			</DialogFooter>
		</DialogContent>
	</Dialog>
{/if}
