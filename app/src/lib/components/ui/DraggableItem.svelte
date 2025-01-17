<script lang="ts">
	import { Grip } from 'lucide-svelte';

	type Props = {
		index: number;
		animateFlip: any;
		onDragStart: (event: DragEvent) => void;
		onDragOver: (event: DragEvent) => void;
		onDrop: (event: DragEvent) => void;
	};

	export const { index, animateFlip, onDragStart, onDragOver, onDrop }: Props = $props();

	import { flip } from 'svelte/animate';
</script>

<div
	class="group relative"
	animate:flip={animateFlip}
	ondragover={onDragOver}
	ondrop={onDrop}
	role="list"
>
	<div
		role="listitem"
		class="absolute -left-14 flex h-full cursor-grab items-center opacity-10 transition-opacity active:cursor-grabbing active:hover:opacity-50 group-hover:opacity-25 xl:-left-20"
		draggable="true"
		ondragstart={onDragStart}
	>
		<Grip size="32" />
	</div>
	<slot />
</div>
