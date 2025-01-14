<script lang="ts">
	import * as RadioGroup from '@/components/ui/radio-group';
	import { CircleHelp, Gauge } from 'lucide-svelte';
	import type { PageServerData } from './$types';
	import { Checkbox } from '@/components/ui/checkbox';
	import { Label } from '@/components/ui/label';
	import { Input } from '@/components/ui/input';
	import QuestionCodeBlock from '../../components/QuestionCodeBlock.svelte';
	import QuestionTitle from '../../components/(components)/TestDetailsQuestion/Header/QuestionTitle.svelte';

	const {
		data
	}: {
		data: PageServerData;
	} = $props();

	const hideAnswers = true;
</script>

<section class="py-16">
	<h2 class="mt-3 text-2xl font-bold text-opacity-50">
		{data.test.title ?? 'Title'}
	</h2>
	<div class="mt-3 flex gap-x-4 text-sm">
		<span class="flex items-center gap-x-1"
			><CircleHelp size="12" /> {data.test.questions?.length} Questions</span
		>
	</div>
	<div class="relative mt-8 flex h-full w-full flex-col">
		<div class="flex w-full flex-col gap-y-12">
			{#each data.test.questions ?? [] as question, index (index)}
				<div class={`group relative`} role="list">
					<div class="group flex gap-x-6">
						<div class="w-full">
							<div class="mt-2 w-full">
								<QuestionTitle questionTitle={question.question} />
								{#if question.codeBlock && question.codeBlock.length > 0}
									<div class="mt-1">
										<QuestionCodeBlock
											codeBlock={question.codeBlock}
											codeLanguage={question.codeLang}
										/>
									</div>
								{/if}
							</div>
							{#if question?.answerType === 'single'}
								<RadioGroup.Root class="mt-3" value="option-one">
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
									<div class="mt-3 flex items-center space-x-2">
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
</section>
