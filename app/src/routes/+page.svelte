<script lang="ts">
    import '../app.css';
    import Greeting from './components/Greeting.svelte';
    import QuestionList from './components/QuestionList.svelte';
    import ExportSection from './components/ExportSection.svelte';

    let topic = $state("");
    function onCreateSurvey() {
        // Logic to handle survey creation
    }

</script>

<Greeting bind:topic onCreateSurvey={onCreateSurvey} />

<h2 class="font-bold text-2xl">Geography test</h2>
<div class="w-full flex h-full gap-x-12 relative xl:flex-row flex-col mt-6">
    <QuestionList />
    <ExportSection />
</div>
