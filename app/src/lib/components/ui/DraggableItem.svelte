<script lang="ts">
    import { Grip } from 'lucide-svelte';

    type Props = {
        index: number;
        animateFlip: any;
        onDragStart: (event: DragEvent) => void;
        onDragOver: (event: DragEvent) => void;
        onDrop: (event: DragEvent) => void;
    };

    export const {
        index,
        animateFlip,
        onDragStart,
        onDragOver,
        onDrop,
    }: Props = $props();

    import { flip } from 'svelte/animate';

</script>

<div
        class="relative group"
        animate:flip={animateFlip}
        ondragover={onDragOver}
        ondrop={onDrop}
        role="list"
>
    <div
            role="listitem"
            class="absolute h-full flex cursor-grab active:cursor-grabbing opacity-10 group-hover:opacity-25 transition-opacity active:hover:opacity-50 items-center xl:-left-20 -left-14"
            draggable="true"
            ondragstart={onDragStart}
    >
        <Grip size="32" />
    </div>
    <slot />
</div>