<script lang="ts">
	import { Grip } from 'lucide-svelte';
	import TestDetailsQuestion from './QuestionDetails.svelte';
	import type { QuestionState, TestState } from '../types';
	import type { Question } from '@/types/entities';

	let draggedIndex: number | null = $state<number | null>(null);

	const {
		initialQuestionsCount,
		test = $bindable()
	}: {
		test: TestState;
		initialQuestionsCount: number;
	} = $props();

	function onDragStart(event: DragEvent, index: number) {
		draggedIndex = index;
		const gripElement = event.currentTarget as HTMLElement;
		const dragImageElement = gripElement.parentNode as HTMLElement;
		const rect = dragImageElement.getBoundingClientRect();
		const offsetX = event.clientX - rect.left;
		const offsetY = event.clientY - rect.top;
		event.dataTransfer?.setDragImage(dragImageElement, offsetX, offsetY);
	}

	function onDragOver(event: DragEvent) {
		event.preventDefault();
	}

	function onDrop(event: DragEvent, targetIndex: number) {
		event.preventDefault();
		if (draggedIndex !== null && draggedIndex !== targetIndex) {
			const qs = test.questions;
			const newQs = [...(qs ?? [])];
			const [draggedItem] = newQs.splice(draggedIndex, 1);
			newQs.splice(targetIndex, 0, draggedItem);
			test.questions = newQs;
		}
		draggedIndex = null;
	}
	const deleteQuestionInStore = (index: number) => test.questions.splice(index, 1);

	const updateQuestionInStore = (index: number, newQuestion: QuestionState) =>
		test.questions.splice(index, 1, newQuestion);

	// That means the question is new because its index is greater than the length of the server side state
	const isQuestionNewlyAdded = (index: number): boolean => index >= initialQuestionsCount;
</script>

<section class="relative flex h-full w-full flex-col">
	<div class="flex w-full flex-col gap-y-12">
		{#each test.questions ?? [] as question, index (index)}
			<div
				class={`group relative -motion-translate-y-in-25 motion-opacity-in-0 motion-delay-[--delay]`}
				style={`--delay: ${!isQuestionNewlyAdded(index) ? 200 + 150 * (index + 1) : 0}ms`}
				ondragover={onDragOver}
				ondrop={(event) => onDrop(event, index)}
				role="list"
			>
				{#if question.status !== 'generated' && question.status !== 'generating'}
					<div
						role="listitem"
						class="absolute -left-14 flex h-full cursor-grab items-center opacity-10 transition-opacity active:cursor-grabbing active:hover:opacity-50 group-hover:opacity-25 xl:-left-20"
						draggable="true"
						ondragstart={(event) => onDragStart(event, index)}
					>
						<Grip size="32" />
					</div>
				{/if}
				<TestDetailsQuestion
					{question}
					updateQuestionInStore={(newQuestion) => updateQuestionInStore(index, newQuestion)}
					testId={test.id}
					deleteQuestionInStore={() => deleteQuestionInStore(index)}
				/>
			</div>
		{/each}
	</div>
</section>
