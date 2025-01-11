<script lang="ts">
	import { Label } from '@/components/ui/label';
	import * as RadioGroup from '@/components/ui/radio-group';
	import { Checkbox } from '@/components/ui/checkbox';
	import { Input } from '@/components/ui/input';
	import type { GeneratingSurveyCompletion } from '@/types/entities.js';
	import { CircleHelp, Gauge } from 'lucide-svelte';

	const {
		generatingSurvey,
		hideAnswers
	}: {
		hideAnswers?: boolean;
		generatingSurvey: GeneratingSurveyCompletion;
	} = $props();
</script>

<h2 class="mt-3 text-2xl font-bold text-opacity-50">
	{generatingSurvey.title ?? 'Title'}
</h2>
<div class="mt-3 flex gap-x-4 text-sm">
	<span class="flex items-center gap-x-1"
		><CircleHelp size="12" /> {generatingSurvey.questions?.length} Questions</span
	>
	<!-- <span class="flex items-center gap-x-1"><Timer size="12" /> 10 Minutes</span> -->
	<span class="flex items-center gap-x-1"><Gauge size="12" /> {generatingSurvey.difficulty}</span>
</div>
<div class="relative mt-8 flex h-full w-full flex-col">
	<div class="flex w-full flex-col gap-y-12">
		{#each generatingSurvey.questions ?? [] as question, index (index)}
			<div class={`group relative`} role="list">
				<div class="group flex gap-x-6">
					<div class="w-full">
						<h3 class="mb-5 inline-flex w-full justify-between gap-x-2 text-xl font-medium">
							{question?.question}
						</h3>
						{#if question?.answerType === 'single'}
							<RadioGroup.Root value="option-one">
								{#each question.options ?? [] as option, index}
									<div class="flex items-center space-x-2">
										<RadioGroup.Item value={option?.value ?? ''} id={`radio-${index}`} />
										<Label for={`radio-${index}`}
											>{option?.value}
											{#if option?.isCorrect && !hideAnswers}
												<span class="text-green">✅</span>
											{/if}
										</Label>
									</div>
								{/each}
							</RadioGroup.Root>
						{:else if question?.answerType === 'multiple'}
							{#each question.options ?? [] as option, index}
								<div class="mt-2 flex items-center space-x-2">
									<Checkbox id={`checkbox-${index}`} />
									<Label for={`checkbox-${index}`}>
										{option?.value}
										{#if option?.isCorrect && !hideAnswers}
											<span class="text-green ml-2">✅</span>
										{/if}
									</Label>
								</div>
							{/each}
						{:else if question?.answerType === 'text'}
							<Input type="text" class="mt-2 max-w-[400px]" />
							{#if !hideAnswers}
								<span class="text-xs text-gray-500">Answer: {question.correctAnswer}</span>
							{/if}
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</div>
