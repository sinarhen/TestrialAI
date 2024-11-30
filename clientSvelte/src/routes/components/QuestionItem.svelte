<script lang="ts">
    import {Grip, Info, Pencil, Plus, Trash2} from "lucide-svelte";
    import { Label } from "@/components/ui/label";
    import * as RadioGroup from "$lib/components/ui/radio-group";
    import { Checkbox } from "@/components/ui/checkbox";
    import { fade } from 'svelte/transition';
    import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
    import { Button } from "@/components/ui/button";
    import type { Question } from "@/types";
    import { Input } from "@/components/ui/input";
    import cloneDeep from "lodash.clonedeep";

    const {
        question,
        onDelete,
        onEdit
    }: {
        question: Question,
        onDelete: (id: number) => void,
        onEdit: (id: number, updatedQuestion: Question) => void
    } = $props();

    let isDialogOpen = $state(false);
    let updatedQuestion: Question = $state(cloneDeep(question));

    function handleDelete() {
        onDelete(question.id);
    }

    function handleSave() {
        onEdit(question.id, cloneDeep(updatedQuestion));
        isDialogOpen = false; // Close the dialog after saving
    }

    function deleteOption(index: number) {
        updatedQuestion.options.splice(index, 1);
    }

    function createOption() {
        updatedQuestion.options.push({
            value: "New option",
            correct: false,
        });
    }
</script>

<div class="group flex gap-x-6" transition:fade>

    <div>
        <h3 class="text-xl mb-5 font-medium inline-flex items-center gap-x-2">
            {question.question}
            <Dialog open={isDialogOpen} onOpenChange={() => { isDialogOpen = !isDialogOpen }}>
                <DialogTrigger>
                    <button
                            class="xl:opacity-0 opacity-50 transition-opacity xl:group-hover:opacity-25 xl:hover:opacity-50"
                            onclick={() => (isDialogOpen = true)}
                    >
                        <Pencil size="16" />
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Question</DialogTitle>
                        <DialogDescription>
                            Modify the details of the question below.
                        </DialogDescription>
                    </DialogHeader>
                    <div class="space-y-6">
                        <div>
                            <Label class="inline-flex gap-x-0.5" for={`type-${question.id}`}>
                                Answer type
                                <Info size="10"/>
                            </Label>
                            <RadioGroup.Root class="mt-2 gap-x-2" id={`type-${question.id}`} >
                                <div class="flex items-center space-x-2">
                                    <RadioGroup.Item value="single" id="single" />
                                    <Label for="single" >Single</Label>
                                </div>
                                <div class="flex items-center space-x-2">
                                    <RadioGroup.Item value="multiple" id="multiple" />
                                    <Label for="multiple">Multiple</Label>
                                </div>
                            </RadioGroup.Root>

                        </div>
                        <div>
                            <Label for={`question-${updatedQuestion.id}`} class="block">
                                Question:
                            </Label>
                            <Input
                                    class="mt-2"
                                    id={`question-${updatedQuestion.id}`}
                                    bind:value={updatedQuestion.question}
                            />

                        </div>
                        <div>
                            <Label>Options</Label>
                            {#each updatedQuestion.options as option, index}
                                <div class="flex items-center space-x-2 mt-2">
                                    <Input
                                            type="text"
                                            id={`option-${updatedQuestion.id}-${index}`}
                                            bind:value={option.value}
                                            class="input flex-1"
                                    />
                                    <Checkbox
                                            id={`checkbox-${updatedQuestion.id}-${index}`}
                                            bind:checked={option.correct}
                                    />
                                    <Trash2 onclick={() => deleteOption(index)} class="text-destructive cursor-pointer" size="16" />
                                </div>
                            {/each}
                            <Button onclick={createOption} class="w-full mt-2" variant="link"><Plus size="16" />Add new</Button>
                        </div>
                    </div>
                    <DialogFooter class="gap-y-2">
                        <Button on:click={handleSave}>Save</Button>
                        <Button variant="outline" on:click={() => (isDialogOpen = false)}>Cancel</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <button
                    onclick={handleDelete}
                    class="xl:opacity-0 opacity-50 text-destructive transition-opacity xl:group-hover:opacity-25 xl:hover:opacity-50"
            >
                <Trash2 size="16" />
            </button>
        </h3>
        {#if question.type === "single"}
            <RadioGroup.Root value="option-one">
                {#each question.options as option, index}
                    <div class="flex items-center space-x-2">
                        <RadioGroup.Item value={option.value} id={`radio-${question.id}-${index}`} />
                        <Label for={`radio-${question.id}-${index}`}>{option.value}
                            {#if option.correct}
                                <span class="text-green">✅</span>
                            {/if}
                        </Label>
                    </div>
                {/each}
            </RadioGroup.Root>
        {:else if question.type === "multiple"}
            {#each question.options as option, index}
                <div class="flex items-center mt-2 space-x-2">
                    <Checkbox id={`checkbox-${question.id}-${index}`} />
                    <Label for={`checkbox-${question.id}-${index}`}>
                        {option.value}
                        {#if option.correct}
                            <span class="text-green ml-2">✅</span>
                        {/if}
                    </Label>
                </div>
            {/each}
        {/if}
    </div>

</div>