<script lang="ts">
    import {Input} from "@/components/ui/input";
    import {Button} from "@/components/ui/button";
    import {toast} from "svelte-sonner";
    import {currentSurveyStore} from "@/stores/questions.svelte";
    import { fade } from 'svelte/transition';
	import axios, { AxiosError } from "axios";
	import { invalidate } from "$app/navigation";

    let {
        topic = $bindable("Napoleonic wars"),
        userName = "stranger"
    }: {
        topic: string;
        userName?: string;
    } = $props();

    const onGenerate = async () => {
        currentSurveyStore.isGenerating = true;
        
        try {
            const res = await axios.post("generate-survey", {
                topic
            })
            if (res.status !== 200){
                toast.error(res.statusText)
                return;
            }
            invalidate('/');
            currentSurveyStore.survey = res.data;
            toast.success("Successfully generated a survey")
            
        } catch (err){
            if (axios.isAxiosError(err)){
                toast.error(err.message);
                console.log(err.status);
            } else {
                console.log(err)
            }
        } finally {
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
        <Input name="topic" disabled={currentSurveyStore.isGenerating} bind:value={topic} placeholder="Napoleonic wars" class="w-[400px] mt-2" />
        <Button onclick={onGenerate} disabled={currentSurveyStore.isGenerating} type="submit" class="mt-2">
            Create survey
        </Button>
    </div>
</div>

{#if currentSurveyStore.isGenerating}
    <div class="flex h-full flex-col justify-center text-gray-500 text-sm items-center w-full relative">
            <div transition:fade={{duration: 500}} class="flex animate-pulse gap-x-2 items-center">
                <span>Loading...</span>
            </div>
    </div>
{/if}