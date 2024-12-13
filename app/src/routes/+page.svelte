<script lang="ts">
    import '../app.css';
    import Greeting from './components/Greeting.svelte';
    // import ExportSection from './components/ExportSection.svelte';
    import type { ActionData, PageServerData } from './$types';
    import Header from "./components/Header/Header.svelte";
    import QuestionList from "./components/QuestionList/QuestionList.svelte";
    import {CircleHelp, Gauge, Timer} from "lucide-svelte";

    let topic: string = $state("Geography test");
    let { data, form }: { data: PageServerData, form: ActionData } = $props();

    function onCreateSurvey() {
        topic = "Survey";
    }
</script>

<Header {data} {form} />

<Greeting bind:topic userName={data.user?.username} onCreateSurvey={onCreateSurvey} />

<h2 class="font-bold text-2xl">Geography test</h2>
<div class="text-sm flex mt-1 gap-x-4">
    <span class="gap-x-1 flex items-center"><CircleHelp size="12"/> 8 Questions</span>
    <span class="gap-x-1 flex items-center"><Timer size="12"/> 10 Minutes</span>
    <span class="gap-x-1 flex items-center"><Gauge size="12"/> Hard</span>
</div>
<div class="w-full flex h-full gap-x-12 relative xl:flex-row flex-col mt-6">
    <QuestionList />
<!--    <ExportSection />-->
</div>