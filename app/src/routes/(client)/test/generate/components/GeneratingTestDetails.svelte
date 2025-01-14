<script lang="ts">
	import { Label } from '@/components/ui/label';
	import * as RadioGroup from '@/components/ui/radio-group';
	import { Checkbox } from '@/components/ui/checkbox';
	import { Input } from '@/components/ui/input';
	import type { GeneratingTestCompletion } from '@/types/entities.js';
	import { CircleHelp } from 'lucide-svelte';
	import QuestionTitleWithCodeBlock from '../../[id]/components/(components)/TestDetailsQuestion/Header/QuestionTitle.svelte';
	import QuestionCodeBlock from '../../[id]/components/QuestionCodeBlock.svelte';

	const {
		generatingTest
	}: {
		generatingTest: GeneratingTestCompletion;
	} = $props();
</script>

<section class="animate-pulse">
	<h2 class="mt-3 text-2xl font-bold text-opacity-50">
		{generatingTest.title ?? 'Title'}
	</h2>
	<div class="mt-3 flex gap-x-4 text-sm">
		<span class="flex items-center gap-x-1"
			><CircleHelp size="12" /> {generatingTest.questions?.length} Questions</span
		>
		<!-- <span class="flex items-center gap-x-1"><Timer size="12" /> 10 Minutes</span> -->
	</div>
	<div class="relative mt-8 flex h-full w-full flex-col">
		<div class="flex w-full flex-col gap-y-12">
			{#each generatingTest.questions ?? [] as question, index (index)}
				<div class={`group relative`} role="list">
					<div class="group flex gap-x-6">
						<div class="w-full">
							<QuestionTitleWithCodeBlock questionTitle={question?.question} />
							{#if question?.codeBlock}
								<QuestionCodeBlock
									codeBlock={question?.codeBlock}
									codeLanguage={question?.codeLang}
								/>
							{/if}
							<div class="mt-4">
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
				</div>
			{/each}
		</div>
	</div>
</section>
