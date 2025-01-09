<script lang="ts">
	import { Label } from '@/components/ui/label';
	import * as RadioGroup from '@/components/ui/radio-group';
	import { Checkbox } from '@/components/ui/checkbox';
	import { Input } from '@/components/ui/input';
	import type { GeneratingSurveyCompletion } from '@/types/entities.js';

	const {
		generatingSurvey
	}: {
		generatingSurvey: GeneratingSurveyCompletion;
	} = $props();
</script>

<section class="relative mt-8 flex h-full w-full flex-col">
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
											{#if option?.isCorrect}
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
										{#if option?.isCorrect}
											<span class="text-green ml-2">✅</span>
										{/if}
									</Label>
								</div>
							{/each}
						{:else if question?.answerType === 'text'}
							<Input type="text" class="mt-2 max-w-[400px]" />
							<span class="text-xs text-gray-500">Answer: {question.correctAnswer}</span>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
</section>
