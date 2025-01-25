<script lang="ts">
	import AccordionStep from './AccordionStep.svelte';
	import { steps } from '../index.svelte';

	const {
		disabled
	}: {
		disabled: boolean;
	} = $props();
</script>

<AccordionStep {disabled} class="border-b-0" {...steps.other}>
	<p class="text-center text-xs">Here you can change other settings for the test.</p>
</AccordionStep>
