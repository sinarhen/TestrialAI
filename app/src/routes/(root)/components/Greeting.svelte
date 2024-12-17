<script lang="ts">
    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";
    import type {SubmitFunction} from "@sveltejs/kit";
    import {toast} from "svelte-sonner";
    import {applyAction} from "$app/forms";
    import {invalidateAll} from "$app/navigation";
    import {enhance} from "$app/forms";
    import {currentSurveyStore} from "@/stores/questions.svelte";
    import type {Survey} from "@/types";

    let {
        topic = $bindable("Napoleonic wars"),
        userName = "stranger"
    }: {
        topic: string;
        userName?: string;
    } = $props();

    const onGenerate: SubmitFunction = () => {
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
                            return;
                        }
                        const response = JSON.parse(generationResult) as Survey;
                        console.log(response);
                        currentSurveyStore.survey = response;
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
        }
    }
</script>

<div class="w-full h-[45vh] flex flex-grow flex-col justify-end items-center">
    <h1 class="text-3xl animate-fadeInSlide">
        Hello, <span class="font-semibold">{userName}</span>👋
    </h1>
    <p class="opacity-0 mt-0.5 animate-fadeInSlide [animation-delay:0.3s]">
        Give us a topic you want to create a survey on
    </p>
    <form use:enhance={onGenerate} method="POST" action="?/startGeneration" class="flex flex-col items-center">
        <Input name="topic" bind:value={topic} placeholder="Napoleonic wars" class="w-[400px] mt-2" />
        <Button type="submit" class="mt-2">
            Create survey
        </Button>
    </form>
</div>