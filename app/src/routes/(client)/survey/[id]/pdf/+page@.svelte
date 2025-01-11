<script lang="ts">
	import GeneratingSurveyDetails from '../../generate/components/StaticSurveyDetails.svelte';
	import type { PageServerData } from './$types';

	const {
		data
	}: {
		data: PageServerData;
	} = $props();
</script>

<div class="h-full w-full py-16">
	<GeneratingSurveyDetails hideAnswers={true} generatingSurvey={data.survey} />
</div>
