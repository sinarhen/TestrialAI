<script lang="ts">
    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";

    export let topic: string;
    export let onCreateSurvey: () => void;
</script>

<div class="w-full h-[75vh] flex flex-grow flex-col justify-center items-center">
    <h1 class="text-3xl animate-fadeInSlide">
        Hello, <span class="font-semibold">stranger</span>👋
    </h1>
    <p class="opacity-0 mt-0.5 animate-fadeInSlide [animation-delay:0.3s]">
        Give us a topic you want to create a survey on
    </p>
    <Input bind:value={topic} placeholder="Napoleonic wars" class="w-[400px] mt-2" />
    <Button class="mt-2" on:click={onCreateSurvey}>
        Create survey
    </Button>
</div>