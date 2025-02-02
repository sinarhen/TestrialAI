<script lang="ts">
	import { steps } from '../../index.svelte';
	import AccordionStep from './AccordionStep.svelte';

	const {
		disabled
	}: {
		disabled: boolean;
	} = $props();
</script>

<AccordionStep {disabled} class="border-b-0" {...steps.other}>
	<p class="text-center text-xs">Here you can change other settings for the test.</p>
</AccordionStep>
