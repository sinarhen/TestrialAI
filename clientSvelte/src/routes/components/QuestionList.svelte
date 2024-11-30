<script lang="ts">
    import QuestionItem from './QuestionItem.svelte';
    import { Button } from "@/components/ui/button";
    import {Plus, Save, Share2} from "lucide-svelte";
    import type { Question } from "@/types";
    import * as RadioGroup from "$lib/components/ui/radio-group";

    export const {
        questions,
        onDeleteQuestion
    }: {
        questions: Question[];
        onDeleteQuestion: (id: number) => void;
    } = $props();

    function handleEdit(id: number, updatedQuestion: Question) {
        const index = questions.findIndex((q) => q.id === id);
        if (index !== -1) {
            questions[index] = updatedQuestion;
        }
    }
</script>

<section class="flex w-full">
    <div class="xl:max-w-[400px] flex flex-col gap-y-10">
        {#each questions as question (question.id)}
            <QuestionItem

                    question={question}
                    onDelete={onDeleteQuestion}
                    onEdit={handleEdit}
            />
        {/each}
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