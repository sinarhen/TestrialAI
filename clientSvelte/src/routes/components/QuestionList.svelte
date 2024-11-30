<script lang="ts">
    import QuestionItem from './QuestionItem.svelte';
    import {Grip, Plus, Save, Share2} from "lucide-svelte";
    import type { Question } from "@/types";
    import { flip } from "svelte/animate";
    import {Button} from "@/components/ui/button";

    export let questions: Question[];
    export let onDeleteQuestion: (id: number) => void;

    function handleEdit(id: number, updatedQuestion: Question) {
        const index = questions.findIndex((q) => q.id === id);
        if (index !== -1) {
            questions[index] = updatedQuestion;
        }
    }

    let draggedIndex: number | null = null;

    function onDragStart(event: DragEvent, index: number) {
        draggedIndex = index;

        const gripElement = event.currentTarget as HTMLElement;
        const dragImageElement = gripElement.parentNode as HTMLElement;

        // Get the cursor position relative to the drag image element
        const rect = dragImageElement.getBoundingClientRect();
        const offsetX = event.clientX - rect.left;
        const offsetY = event.clientY - rect.top;

        // Set the drag image with the correct offset
        event.dataTransfer?.setDragImage(dragImageElement, offsetX, offsetY);
    }

    function onDragOver(event: DragEvent) {
        event.preventDefault(); // Allow drop
    }

    function onDrop(event: DragEvent, targetIndex: number) {
        event.preventDefault();

        if (draggedIndex !== null && draggedIndex !== targetIndex) {
            const draggedItem = questions[draggedIndex];
            questions.splice(draggedIndex, 1);
            questions.splice(targetIndex, 0, draggedItem);
        }

        draggedIndex = null;
    }
</script>

<section class="flex w-full">
    <div class=" flex flex-col gap-y-10 w-full">
        {#each questions as question, index (question.id)}
            <div
                    class="relative group"
                    animate:flip={{ duration: 300 }}
                    on:dragover={onDragOver}
                    on:drop={(event) => onDrop(event, index)}
                    role="list"
            >
                <div
                        role="listitem"
                        class="absolute flex cursor-grab active:cursor-grabbing opacity-10 group-hover:opacity-25 transition-opacity active:hover:opacity-50 items-center xl:-left-20 -left-14"
                        draggable="true"
                        on:dragstart={(event) => onDragStart(event, index)}
                >
                    <Grip size="32" />
                </div>
                <QuestionItem
                        question={question}
                        onDelete={onDeleteQuestion}
                        onEdit={handleEdit}
                />
            </div>
        {/each}
        <!-- Add Question Button and other components -->
        <Button variant="outline" class="flex items-center justify-center gap-x-1">
            <Plus size="16" />
            Add question
        </Button>
        <div class="flex w-full xl:justify-start justify-center">
            <div class="grid w-full gap-y-2 gap-x-2 grid-cols-4">
                <Button class="col-span-4 gap-x-1">
                    <Save size="16" />
                    Save
                </Button>
                <Button variant="outline" class="gap-x-1 inline-flex xl:hidden col-span-4">
                    <Share2 size="16" />
                    Share
                </Button>
            </div>
        </div>
    </div>

</section>
