<script lang="ts">
    import '../../app.css';
    import Greeting from './components/Greeting.svelte';
    // import ExportSection from './components/ExportSection.svelte';
    import Header from "./components/Header/Header.svelte";
    import QuestionList from "./components/QuestionList/QuestionList.svelte";
    import {CircleHelp, Gauge, Timer} from "lucide-svelte";
    import {currentSurveyStore} from "@/stores/questions.svelte.js";
    import type {ActionData, PageServerData} from "../../../.svelte-kit/types/src/routes/(root)/$types";
    let topic: string = $state("Geography test");
    let { data, form }: { data: PageServerData, form: ActionData } = $props();

</script>

<Header {data} {form} />

<Greeting bind:topic userName={data.user?.username} />

{#if currentSurveyStore.survey}
    <h2 class="font-bold text-2xl">{currentSurveyStore.survey.title}</h2>
    <div class="text-sm flex mt-1 gap-x-4">
        <span class="gap-x-1 flex items-center"><CircleHelp size="12"/> {currentSurveyStore.survey.questions.length} Questions</span>
        <span class="gap-x-1 flex items-center"><Timer size="12"/> 10 Minutes</span>
        <span class="gap-x-1 flex items-center"><Gauge size="12"/> {currentSurveyStore.survey.difficulty}</span>
    </div>
    <div class="w-full flex h-full gap-x-12 relative xl:flex-row flex-col mt-6">
        <QuestionList />
        <!--    <ExportSection />-->
    </div>
{/if}
