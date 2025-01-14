<script lang="ts">
	import { Label } from '@/components/ui/label';
	import { questionState, type QuestionState } from '../../../types';
	import * as RadioGroup from '@/components/ui/radio-group';
	import { Checkbox } from '@/components/ui/checkbox';
	import { Input } from '@/components/ui/input';
	const {
		question
	}: {
		question: QuestionState;
	} = $props();
</script>

{#if question.answerType === 'single'}
	<RadioGroup.Root disabled={questionState.isGenerating(question)} value="option-one">
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
				<Checkbox
					disabled={questionState.isGenerating(question)}
					id={`checkbox-${question.question}-${index}`}
				/>
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
	<Input disabled={questionState.isGenerating(question)} type="text" class="mt-2 max-w-[400px]" />
	<p class="mt-1 text-xs opacity-75">{question.correctAnswer}</p>
{/if}

{#if question.answerExplanation}
	<p class="mt-2 text-xs opacity-50">{question.answerExplanation}</p>
{/if}
