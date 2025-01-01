<script lang="ts">
	import { type Question } from '@/types/entities';
	import {
		Difficulties,
		type Difficulty,
		type Option,
		type Survey,
		type SurveySchemaType
	} from '@/types/entities';
	import { Input } from '@/components/ui/input';
	import { Button } from '@/components/ui/button';
	import { toast } from 'svelte-sonner';
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import type { SupportedModel } from '@/types/openai';
	import type { Selected } from 'bits-ui';

	import * as RadioGroup from '@/components/ui/radio-group';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '@/components/ui/label';
	import { streamOpenAiResponse } from '@/utils/openai-stream';
	import { v4 } from 'uuid';
	import { saveSurvey } from '@/actions';
	import { Slider } from '$lib/components/ui/slider/index';

	let {
		userName = 'stranger'
	}: {
		userName?: string;
	} = $props();

	const modelList: Selected<SupportedModel>[] = [
		{ label: 'GPT-4o', value: 'gpt-4o' },
		{ label: 'GPT-4o mini', value: 'gpt-4o-mini' }
	];

	let topic = $state<string | undefined>();
	let modelSelected = $state<Selected<SupportedModel> | undefined>(modelList[0]);
	let difficulty = $state<Difficulty>(Difficulties.HARD);
	let numberOfQuestions = $state<number>(10);

	const onGenerateSurvey = async () => {
		if (currentSurveyStore.isGenerating) {
			toast.error('Already generating a survey');
			return;
		}
		const tempSurveyId = v4();

		const questionsIds: string[] = Array.from({ length: numberOfQuestions }, () => v4());
		let optionIds: string[][] = Array.from({ length: numberOfQuestions }, () => []);

		currentSurveyStore.isGenerating = true;

		await streamOpenAiResponse<Partial<SurveySchemaType>, SurveySchemaType>({
			endpoint: '/generate-survey',
			body: {
				topic,
				difficulty,
				numberOfQuestions
			},
			onPartial: ({ partialData }) => {
				currentSurveyStore.survey = {
					...partialData,

					id: tempSurveyId,
					title: '',
					questions:
						partialData.questions?.map(
							(question, questionIndex) =>
								({
									...question,

									id: questionsIds[questionIndex],
									options: question.options?.map((option, optionIndex) => {
										let generatedId = optionIds.at(questionIndex)?.at(optionIndex);
										if (!generatedId) {
											generatedId = v4();
											optionIds[questionIndex][optionIndex] = generatedId;
										}
										return {
											...option,
											id: generatedId
										};
									})
								}) as Question
						) ?? [],
					difficulty
				};
			},
			onComplete: async ({ finalData }) => {
				toast.success('Survey generated successfully');
				const resp = toast.promise(saveSurvey(finalData), {
					loading: 'Saving survey...',
					success: (data) => {
						if (!resp) {
							return 'Failed to save survey. Try to do it manually';
						}
						data.json().then((survey: Survey) => {
							console.log(survey);
							currentSurveyStore.survey = survey;
						});
						return 'Survey saved successfully';
					},
					error: (err) => {
						currentSurveyStore.isDirty = true;
						console.error(err);
						return 'Failed to save survey. Try to do it manually';
					}
				});
			},
			onError: (err) => {
				console.error(err);
				toast.error('Failed to generate survey');
			},
			onFinish: () => {
				currentSurveyStore.isGenerating = false;
			}
		});
	};
</script>

<div class="flex h-[65vh] w-full flex-grow flex-col items-center justify-center">
	<div class="flex flex-col items-center justify-end">
		<h1 class="animate-fadeInSlide text-3xl">
			Hello, <span class="font-semibold">{userName}</span>👋
		</h1>
		<p class="animate-fadeInSlide mt-0.5 opacity-0 [animation-delay:0.3s]">
			Give us a topic you want to create a survey on
		</p>
		<div class="mt-5 flex w-full items-center justify-center gap-x-1">
			<Input
				name="topic"
				disabled={currentSurveyStore.isGenerating}
				bind:value={topic}
				placeholder="Napoleonic wars"
				class="w-[350px]"
			/>
			<Select.Root
				selected={modelSelected}
				onSelectedChange={(val) => (modelSelected = val)}
				name="model"
			>
				<Select.Trigger class="w-32 whitespace-nowrap ">
					<Select.Value />
				</Select.Trigger>
				<Select.Content>
					{#each modelList as model (model)}
						<Select.Item class="whitespace-nowrap" value={model.value}>
							{model.label}
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>
		</div>
		<div class="flex w-full items-center justify-between gap-x-5">
			<RadioGroup.Root bind:value={difficulty} class="mt-5 flex w-full gap-x-5">
				{#each Object.values(Difficulties) as diff}
					<div class="items center flex space-x-2">
						<RadioGroup.Item disabled={currentSurveyStore.isGenerating} value={diff} id={diff} />
						<Label for={diff}>{diff}</Label>
					</div>
				{/each}
			</RadioGroup.Root>

			<div class="mt-4 flex w-full flex-col items-end gap-y-1 whitespace-nowrap text-right text-sm">
				<Slider
					class="mt-2 w-1/2"
					disabled={currentSurveyStore.isGenerating}
					value={[numberOfQuestions]}
					onValueChange={(val) => (numberOfQuestions = val[0])}
					max={14}
					min={6}
					step={1}
				/>
				{numberOfQuestions} questions
			</div>
		</div>

		<Button
			onclick={onGenerateSurvey}
			disabled={currentSurveyStore.isGenerating}
			type="submit"
			class="mt-5"
		>
			Create survey
		</Button>
	</div>
</div>
