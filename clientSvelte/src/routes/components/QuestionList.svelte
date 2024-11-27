<script lang="ts">
    import QuestionItem from './QuestionItem.svelte';
    import { Button } from "@/components/ui/button";
    import { Save, Share2 } from "lucide-svelte";
    import type { Question } from "@/types";

    export let questions: Question[];
    export let onDeleteQuestion: (id: number) => void;
    export let onEditQuestion: (id: number) => void;
</script>

<section class="flex w-full flex-col gap-y-10">
    {#each questions as question (question.id)}
        <QuestionItem {question} onDelete={onDeleteQuestion} onEdit={onEditQuestion} />
    {/each}
    <div class="flex w-full xl:justify-start justify-center">
        <div class="grid w-full gap-y-2 xl:max-w-[400px] gap-x-2 grid-cols-4">
            <Button class="col-span-4 gap-x-1">
                <Save size="16"/>
                Save
            </Button>
            <Button variant="outline" class="gap-x-1 inline-flex xl:hidden col-span-4">
                <Share2 size="16" />
                Share
            </Button>
        </div>
    </div>
</section>