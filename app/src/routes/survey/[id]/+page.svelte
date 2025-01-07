<script lang="ts">
	import { CircleHelp, Gauge, PlusCircle, Save, Share, Share2, Trash2 } from 'lucide-svelte';
	import QuestionList from './(components)/SurveyDetails.svelte';
	import type { PageServerData } from './$types';
	import { Button } from '@/components/ui/button';
	import axios from 'axios';
	import { toast } from 'svelte-sonner';
	import { deleteSurvey, updateSurvey } from '@/actions';
	import AddQuestionButton from './(components)/AddQuestionButton.svelte';
	import GenerateQuestionButton from './(components)/GenerateQuestionButton.svelte';
	import { goto, invalidate } from '$app/navigation';
	import { currentSurvey } from '@/stores/survey-details.svelte';
	import * as Dialog from '@/components/ui/dialog';
	import Separator from '@/components/ui/separator/separator.svelte';
	import * as AlertDialog from '@/components/ui/alert-dialog';

	const {
		data
	}: {
		data: PageServerData;
	} = $props();

	$effect(() => {
		if (!data.survey) return;
		currentSurvey.survey = data.survey;
		currentSurvey.isDirty = false;
	});

	const saveCurrentSurvey = async () => {
		if (!currentSurvey.survey) return;

		try {
			const res = await updateSurvey(currentSurvey.survey);
			if (res.status !== 200) {
				throw new Error('Failed to save survey');
			}
			currentSurvey.isDirty = false;
			toast.success('Survey saved');
		} catch (e: unknown) {
			console.error(e);
			if (axios.isAxiosError(e)) {
				toast.error('Failed to save survey');
			}
		}
	};
</script>

{#if currentSurvey.survey}
	<div class="flex gap-x-2">
		<Button
			variant="outline"
			size="sm"
			class="-motion-translate-y-in-50 motion-opacity-in-0 motion-duration-500  gap-x-1"
			onclick={() => {
				goto('/');
			}}>Generate new <PlusCircle size="12" /></Button
		>
		<Dialog.Root>
			<Dialog.Trigger>
				<Button
					variant="outline"
					size="sm"
					class="-motion-translate-y-in-50 motion-delay-[75ms] motion-opacity-in-0 motion-duration-500 gap-x-1"
				>
					Share <Share size="12" />
				</Button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Share survey</Dialog.Title>
				</Dialog.Header>
				<Dialog.Description>Share this survey with your friends</Dialog.Description>
				<div>
					<Button
						variant="outline"
						class="block h-auto w-full cursor-pointer outline-2 hover:outline"
					>
						survey.co/public/9JDO34SZ320S34<br />
					</Button>
					<p class="mt-1 text-center text-sm opacity-50">click to copy</p>
				</div>
				<Separator class="mb-4 mt-3" />
				<!-- <Dialog.Footer>
					<Button>Copy link</Button>
				</Dialog.Footer> -->
				<div>
					<p class="text-center text-sm opacity-50">Or export as:</p>
					<!-- <Button
						class="mt-2 flex h-12 w-full items-center justify-center rounded-md border text-xs"
					>
						Google forms
					</Button> -->
					<Button
						variant="outline"
						class="mt-2 flex h-12 w-full items-center justify-center rounded-md border text-xs"
					>
						PDF
					</Button>
					<Button
						variant="outline"
						class="mt-2 flex h-12 w-full items-center justify-center rounded-md border text-xs"
					>
						Google forms
					</Button>
				</div>
			</Dialog.Content>
		</Dialog.Root>
		<Separator orientation="vertical" class="motion-delay-[150ms] motion-opacity-in-0" />

		<AlertDialog.Root>
			<AlertDialog.Trigger asChild let:builder>
				<Button
					class="-motion-translate-y-in-50 motion-delay-[150ms] motion-opacity-in-0 motion-duration-500 gap-x-1"
					size="sm"
					onclick={() => {}}
					builders={[builder]}
					variant="outline"
				>
					Delete <Trash2 size="12" />
				</Button>
			</AlertDialog.Trigger>
			<AlertDialog.Content>
				<AlertDialog.Header>
					<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
					<AlertDialog.Description>
						This action cannot be undone. This will permanently delete this survey and remove data
						from our servers.
					</AlertDialog.Description>
				</AlertDialog.Header>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action
						onclick={() => {
							if (currentSurvey.survey?.id) {
								deleteSurvey(currentSurvey.survey.id)
									.then((res) => {
										if (res.status < 300 && res.status >= 200) {
											toast.success('Survey is deleted successfully');
											currentSurvey.survey = null;
											currentSurvey.isDirty = false;
											currentSurvey.isGenerating = false;

											goto('/');
											invalidate('/');
										}
									})
									.catch((err) => {
										console.error(err);
										toast.error('Something went wrong. Please try again later');
									});
							} else {
								console.error('Survey has no ID');
								toast.error('Internal error. Please try again later.');
							}
						}}>Continue</AlertDialog.Action
					>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	</div>
	<h2
		class="motion-opacity-in-0 motion-preset-confetti motion-duration-1500 motion-delay-200 mt-7 text-2xl font-bold"
	>
		{currentSurvey.survey.title}
	</h2>

	<div class="mt-3 flex gap-x-4 text-sm">
		<span class="motion-opacity-in-0 motion-delay-300 flex items-center gap-x-1"
			><CircleHelp size="12" /> {currentSurvey.survey.questions?.length} Questions</span
		>
		<span class="motion-delay-300 motion-opacity-in-0 flex items-center gap-x-1"
			><Gauge size="12" /> {currentSurvey.survey.difficulty}</span
		>
	</div>
	<QuestionList generatedSurveyQuestionsCount={data.survey.questions.length} />

	<div class="mt-16 flex">
		<AddQuestionButton />
		<GenerateQuestionButton />
	</div>

	<div class="mt-8 flex w-full justify-center xl:justify-start">
		<div class="flex w-full gap-x-2">
			<Button
				onclick={saveCurrentSurvey}
				type="submit"
				disabled={!currentSurvey.isDirty}
				class="w-full gap-x-1"
			>
				<Save size="16" />
				Save
			</Button>
			<Button variant="outline" class="col-span-4 inline-flex gap-x-1 xl:hidden">
				<Share2 size="16" />
				Share
			</Button>
		</div>
	</div>
{/if}
