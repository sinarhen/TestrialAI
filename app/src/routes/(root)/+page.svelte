<script lang="ts">
    import '../../app.css';
    import Greeting from './components/Greeting.svelte';
    // import ExportSection from './components/ExportSection.svelte';
    import Header from "./components/Header/Header.svelte";
    import QuestionList from "./components/QuestionList/QuestionList.svelte";
    import {CircleHelp, Gauge, Timer} from "lucide-svelte";
    import {currentSurveyStore} from "@/stores/questions.svelte.js";
    import type {ActionData, PageServerData} from "../../../.svelte-kit/types/src/routes/(root)/$types";
    import {onMount} from "svelte";
    import {fade} from "svelte/transition";

    let topic: string = $state("Geography test");
    let { data, form }: { data: PageServerData, form: ActionData } = $props();

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
</script>

<Header {data} {form} />

<Greeting bind:topic userName={data.user?.username} />

{#if currentSurveyStore.isGenerating}
    <div class="flex flex-col justify-center text-gray-500 text-sm items-center mt-32 w-full relative">
        {#each visibleLoadings as loading, i}
            <div class:animate-pulse={visibleLoadings.length - 1 === i} transition:fade={{duration: 500}} class="flex  gap-x-2 items-center">
                <span>{loading}</span>

            </div>
        {/each}
    </div>
{/if}

{#if currentSurveyStore.survey}
    <h2 class="font-bold text-2xl">{currentSurveyStore.survey.title}</h2>
    <div class="text-sm flex mt-1 gap-x-4">
        <span class="gap-x-1 flex items-center"><CircleHelp size="12"/> 8 Questions</span>
        <span class="gap-x-1 flex items-center"><Timer size="12"/> 10 Minutes</span>
        <span class="gap-x-1 flex items-center"><Gauge size="12"/> Hard</span>
    </div>
    <div class="w-full flex h-full gap-x-12 relative xl:flex-row flex-col mt-6">
        <QuestionList />
        <!--    <ExportSection />-->
    </div>
{/if}
