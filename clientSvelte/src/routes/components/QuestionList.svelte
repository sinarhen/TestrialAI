<script lang="ts">
    import QuestionItem from './QuestionItem.svelte';
    import {Grip, Lock, Plus, Save, Share2, Sparkle, Sparkles} from "lucide-svelte";
    import type { Question } from "@/types";
    import { flip } from "svelte/animate";
    import {Button} from "@/components/ui/button";
    import {toast} from "svelte-sonner";
    import {questions} from "@/stores/questions.svelte";

    function handleEdit(id: number, updatedQuestion: Question) {
        questions.update((qs) => {
            const index = qs.findIndex((q) => q.id === id);
            if (index !== -1) {
                qs[index] = updatedQuestion;
            }
            return qs;
        });
    }

    let draggedIndex: number | null = null;

    function onDeleteQuestion(id: number) {
        questions.update((qs) => {
            const questionIndex = qs.findIndex((q) => q.id === id);
            const question = qs[questionIndex];

            if (question) {
                toast.success("Question deleted successfully!", {
                    action: {
                        label: "Undo",
                        onClick: () => {
                            questions.update((qs) => {
                                qs.splice(questionIndex, 0, question);
                                return qs;
                            });
                        },
                    },
                });
                return qs.filter((q) => q.id !== id);
            } else {
                toast.warning("Internal error");
                return qs;
            }
        });
    }

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

        if (!!draggedIndex && draggedIndex !== targetIndex) {
            questions.update((qs) => {
                const [draggedItem] = qs.splice(draggedIndex, 1);
                qs.splice(targetIndex, 0, draggedItem);
                return qs;
            });
        }

        draggedIndex = null;
    }

    function onCreateQuestion() {
        questions.update((qs) => [
            ...qs,
            {
                id: qs.length + 1,
                question: "New question",
                answerType: "single",
                options: [
                    { value: "Option 1", isCorrect: true },
                    { value: "Option 2", isCorrect: false },
                    { value: "Option 3", isCorrect: false },
                    { value: "Option 4", isCorrect: false },
                ],
            },
        ]);
    }
</script>

<section class="flex flex-col w-full">
    <div class="flex flex-col gap-y-10 w-full">
        {#each $questions as question, index (question.id)}
            <div
                    class="relative group"
                    animate:flip={{ duration: 300 }}
                    ondragover={onDragOver}
                    ondrop={(event) => onDrop(event, index)}
                    role="list"
            >
                <div
                        role="listitem"
                        class="absolute h-full flex cursor-grab active:cursor-grabbing opacity-10 group-hover:opacity-25 transition-opacity active:hover:opacity-50 items-center xl:-left-20 -left-14"
                        draggable="true"
                        ondragstart={(event) => onDragStart(event, index)}
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
        <div class="flex">
            <Button size="sm" onclick={onCreateQuestion} variant="outline" class="flex rounded-r-none items-center w-full justify-center gap-x-1">
                <Plus size="16" />
                Add question
            </Button>
            <Button size="sm" disabled={true} variant="outline" class="flex w-full rounded-l-none items-center justify-center gap-x-1">
                <Sparkles size="16" />
                Generate question
            </Button>
        </div>
    </div>

    <div class="flex mt-16 w-full xl:justify-start justify-center">
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
</section>