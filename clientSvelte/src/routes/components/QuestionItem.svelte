<script lang="ts">
    import { Pencil, Trash2 } from "lucide-svelte";
    import { Label } from "@/components/ui/label";
    import * as RadioGroup from "$lib/components/ui/radio-group";
    import { Checkbox } from "@/components/ui/checkbox";
    import { fade } from 'svelte/transition';
    import type { Question } from "@/types";

    export let question: Question;
    export let onDelete: (id: number) => void;
    export let onEdit: (id: number) => void;

    function handleDelete() {
        onDelete(question.id);
    }

    function handleEdit() {
        onEdit(question.id);
    }
</script>

<div class="group grid transition-all" transition:fade>
    <h3 class="text-xl mb-5 font-medium inline-flex items-center gap-x-2">
        {question.question}
        <button class="xl:opacity-0 opacity-50 transition-opacity xl:group-hover:opacity-25 xl:hover:opacity-50" on:click={handleEdit}>
            <Pencil size="16" />
        </button>
        <button on:click={handleDelete} class="xl:opacity-0 opacity-50 text-destructive transition-opacity xl:group-hover:opacity-25 xl:hover:opacity-50">
            <Trash2 size="16" />
        </button>
    </h3>
    {#if question.type === "single"}
        <RadioGroup.Root value="option-one">
            {#each question.options as option}
                <div class="flex items-center space-x-2">
                    <RadioGroup.Item value={option.value} id={option.value} />
                    <Label for={option.value}>{option.value}
                        {#if option.correct}
                            <span class="text-green">✅</span>
                        {/if}
                    </Label>
                </div>
            {/each}
        </RadioGroup.Root>
    {:else if question.type === "multiple"}
        {#each question.options as option}
            <div class="flex items-center mt-2 space-x-2">
                <Checkbox />
                <Label for={option.value}>
                    {option.value}
                    {#if option.correct}
                        <span class="text-green ml-2">✅</span>
                    {/if}
                </Label>
            </div>
        {/each}
    {/if}
</div>