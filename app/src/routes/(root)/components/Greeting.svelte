<script lang="ts">
    import {Input} from "@/components/ui/input";
    import {Button} from "@/components/ui/button";
    import type {SubmitFunction} from "@sveltejs/kit";
    import {toast} from "svelte-sonner";
    import {applyAction, enhance} from "$app/forms";
    import {invalidateAll} from "$app/navigation";
    import {currentSurveyStore} from "@/stores/questions.svelte";
    import type {Survey} from "@/types";
    import {onMount} from "svelte";
    import { fade } from 'svelte/transition';

    let {
        topic = $bindable("Napoleonic wars"),
        userName = "stranger"
    }: {
        topic: string;
        userName?: string;
    } = $props();
    export const fakeLoadings = $state(["Sending request", "Processing data", "Generating questions", "Loading questions", "Almost there", "Finishing up"]);

    let visibleLoadings = $state([fakeLoadings[0]]);
    let currentIndex = 1;

    const INTERVAL_DURATION = 2000;

    onMount(() => {
        const interval = setInterval(() => {
            if (currentIndex < fakeLoadings.length) {
                visibleLoadings.push(fakeLoadings[currentIndex]);
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, INTERVAL_DURATION);

        return () => clearInterval(interval);
    });

    $effect(() => {
        if (!currentSurveyStore.isGenerating){
            currentIndex = 1;
            visibleLoadings = [fakeLoadings[0]];
        }
    })
    const onGenerate: SubmitFunction = () => {
        currentSurveyStore.isGenerating = true;
        return async ({ result }) => {
            switch (result.type) {
                case 'success':
                    {
                        toast.success("Successfully generated")
                        await applyAction(result);
                        await invalidateAll()
                        const generationResult = result.data?.generationResult.choices[0].message.content;
                        if (!generationResult) {
                            toast.error('An unknown error occurred');
                            break;
                        }
                        currentSurveyStore.survey = JSON.parse(generationResult) as Survey;
                        break;
                    }
                case "error":
                    toast.error(result.error)
                    break;
                case "failure":
                    if (result.data && typeof result.data === 'object') {
                        toast.error(Object.entries(result.data).map(([key, value]) => `${key}: ${value}`).join('\n'));
                    } else {
                        toast.error('An unknown error occurred');
                    }
                    break;
                default:
                    toast.warning("Something went wrong. Please try reloading the page.")
                    break;
            }
            currentSurveyStore.isGenerating = false;
        }
    }
</script>

<div class="w-full h-[65vh] flex flex-grow flex-col justify-center items-center">
    <div class="flex  flex-col justify-end items-center">
        <h1 class="text-3xl animate-fadeInSlide">
            Hello, <span class="font-semibold">{userName}</span>👋
        </h1>
        <p class="opacity-0 mt-0.5 animate-fadeInSlide [animation-delay:0.3s]">
            Give us a topic you want to create a survey on
        </p>
        <form use:enhance={onGenerate} method="POST" action="?/startGeneration" class="flex flex-col items-center">
            <Input name="topic" bind:value={topic} placeholder="Napoleonic wars" class="w-[400px] mt-2" />
            <Button disabled={currentSurveyStore.isGenerating} type="submit" class="mt-2">
                Create survey
            </Button>
        </form>
    </div>
</div>

{#if currentSurveyStore.isGenerating}
    <div class="flex h-full flex-col justify-center text-gray-500 text-sm items-center w-full relative">
        {#each visibleLoadings as loading, i}
            <div class:animate-pulse={visibleLoadings.length - 1 === i} transition:fade={{duration: 500}} class="flex  gap-x-2 items-center">
                <span>{loading}</span>
            </div>
        {/each}
    </div>
{/if}