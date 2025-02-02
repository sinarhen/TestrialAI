<script lang="ts">
	import AccordionStep from './AccordionStep.svelte';
	import { Layers, List } from 'lucide-svelte';
	import StepCardSelector from '../../StepCardSelector.svelte';
	import type { DisplayMode } from '@/constants/display-modes';
	import { steps, type Step } from '../../index.svelte';

	const displayModes: {
		icon: any;
		value: DisplayMode;
	}[] = [
		{
			icon: Layers,
			value: 'cards'
		},
		{
			icon: List,
			value: 'list'
		}
	];
	const {
		goToStep,
		setDisplayMode,
		currentDisplayMode,
		disabled
	}: {
		setDisplayMode: (mode: DisplayMode | null) => void;
		currentDisplayMode: DisplayMode | null;
		disabled: boolean;
		goToStep: (step: Step) => void;
	} = $props();

	const { label, value } = steps.displayMode;

	const handleCardClick = (mode: DisplayMode) => {
		if (currentDisplayMode === mode) {
			setDisplayMode(null);
			return;
		}
		setDisplayMode(mode);
		goToStep('duration');
	};
</script>

<AccordionStep {disabled} {label} {value}>
	<p class="text-center text-xs">
		Select the display mode for the test. The display mode will change how the test questions are
		displayed.
	</p>
	<div class="mt-3 flex flex-col gap-3 text-sm sm:flex-row">
		{#each displayModes as mode}
			<StepCardSelector
				selected={currentDisplayMode === mode.value}
				onclick={() => handleCardClick(mode.value)}
			>
				<mode.icon size="24"></mode.icon>
				{mode.value.charAt(0).toUpperCase() + mode.value.slice(1)}
			</StepCardSelector>
		{/each}
		<StepCardSelector disabled={true}>
			<Layers size="24"></Layers>
			Coming soon
		</StepCardSelector>
	</div>
</AccordionStep>
