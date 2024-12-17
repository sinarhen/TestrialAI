<script lang="ts">
    import QuestionItem from './QuestionItem.svelte';
    import AddQuestionButton from './AddQuestionButton.svelte';
    import GenerateQuestionButton from './GenerateQuestionButton.svelte';
    import { currentSurveyStore } from '@/stores/questions.svelte.js';
    import { toast } from 'svelte-sonner';
    import { Button } from '@/components/ui/button';
    import {Grip, Save, Share2} from 'lucide-svelte';
    import type {Question} from "@/types";
    import {flip} from 'svelte/animate';

    let draggedIndex: number | null = null;

    function handleEdit(id: number, updatedQuestion: Question) {
        if (!currentSurveyStore.survey) return;
        currentSurveyStore.survey.questions = currentSurveyStore.survey.questions.map(q => q.id === id ? updatedQuestion : q);
    }

    function onDeleteQuestion(id: number) {
        if (!currentSurveyStore.survey) return;

        const qs = currentSurveyStore.survey.questions;
        const questionIndex = qs.findIndex(q => q.id === id);
        const question = qs[questionIndex];

        if (question) {
            toast.success('Question deleted successfully!', {
                action: {
                    label: 'Undo',
                    onClick: () => {
                        const currentQs = currentSurveyStore.survey!.questions;
                        currentSurveyStore.survey!.questions = [
                            ...currentQs.slice(0, questionIndex),
                            question,
                            ...currentQs.slice(questionIndex),
                        ];
                    },
                },
            });
            currentSurveyStore.survey.questions = qs.filter(q => q.id !== id);
        } else {
            toast.warning('Internal error');
        }
    }

    function onCreateQuestion() {
        if (!currentSurveyStore.survey) return;
        const qs = currentSurveyStore.survey.questions;
        currentSurveyStore.survey.questions = [
            ...qs,
            {
                id: qs.length + 1,
                question: 'New question',
                answerType: 'single',
                options: [
                    { value: 'Option 1', isCorrect: true },
                    { value: 'Option 2', isCorrect: false },
                    { value: 'Option 3', isCorrect: false },
                    { value: 'Option 4', isCorrect: false },
                ],
            },
        ];
    }

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
            const newQs = [...qs];
            const [draggedItem] = newQs.splice(draggedIndex, 1);
            newQs.splice(targetIndex, 0, draggedItem);
            currentSurveyStore.survey.questions = newQs;
        }
        draggedIndex = null;
    }
</script>

<section class="flex flex-col w-full">
    <div class="flex flex-col gap-y-10 w-full">
        {#if currentSurveyStore.survey}
            {#each currentSurveyStore.survey.questions as question, index (question.question)}
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
        {/if}

        <div class="flex">
            <AddQuestionButton onCreate={onCreateQuestion} />
            <GenerateQuestionButton />
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