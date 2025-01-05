<script lang="ts">
	import { flip } from 'svelte/animate';
	import QuestionItem from './QuestionItem.svelte';
	import { currentSurveyStore } from '@/stores/questions.svelte.js';
	import { Grip } from 'lucide-svelte';

	let draggedIndex: number | null = $state<number | null>(null);

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
		if (!currentSurveyStore.survey) return;
		event.preventDefault();
		if (draggedIndex !== null && draggedIndex !== targetIndex) {
			const qs = currentSurveyStore.survey.questions;
			const newQs = [...(qs ?? [])];
			const [draggedItem] = newQs.splice(draggedIndex, 1);
			newQs.splice(targetIndex, 0, draggedItem);
			currentSurveyStore.survey.questions = newQs;
		}
		draggedIndex = null;
	}
</script>

<section class="relative mt-8 flex h-full w-full flex-col">
	<div class="flex w-full flex-col gap-y-12">
		{#if currentSurveyStore.survey}
			{#each currentSurveyStore.survey.questions ?? [] as question, index (index)}
				<div
					class={`motion-opacity-in-0 -motion-translate-y-in-25 motion-delay-[--delay] group relative`}
					style={`--delay: ${currentSurveyStore.isGenerating ? 0 : 200 + 150 * (index + 1)}ms`}
					ondragover={onDragOver}
					ondrop={(event) => onDrop(event, index)}
					role="list"
				>
					<div
						role="listitem"
						class="absolute -left-14 flex h-full cursor-grab items-center opacity-10 transition-opacity active:cursor-grabbing active:hover:opacity-50 group-hover:opacity-25 xl:-left-20"
						draggable="true"
						ondragstart={(event) => onDragStart(event, index)}
					>
						<Grip size="32" />
					</div>
					<QuestionItem {question} />
				</div>
			{/each}
		{/if}
	</div>
</section>
