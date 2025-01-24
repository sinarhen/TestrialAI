<script lang="ts">
	import * as Accordion from '@/components/ui/accordion';
	import type { DisplayMode } from '@/types/entities';
	import type { Step } from '../../index.svelte';
	import DisplayModeStep from './DisplayModeStep.svelte';
	import DurationPickerStep from './DurationPickerStep.svelte';
	import OtherSettingsStep from './OtherSettingsStep.svelte';
	const {
		displayMode,
		duration,
		setDisplayMode,
		setDuration
	}: {
		displayMode: DisplayMode | null;
		duration: number | null;
		setDisplayMode: (value: DisplayMode | null) => void;
		setDuration: (value: number | null) => void;
	} = $props();

	const stepsDisabled: Record<Step, boolean> = $derived({
		displayMode: false,
		duration: !displayMode,
		other: !duration || !displayMode
	});

	let currentStep = $state<Step>('other');
	const goToStep = (toStep: Step) => {
		currentStep = toStep;
	};
</script>

<Accordion.Root value={currentStep}>
	<DisplayModeStep
		disabled={stepsDisabled.displayMode}
		{setDisplayMode}
		currentDisplayMode={displayMode}
		{goToStep}
	/>
	<DurationPickerStep disabled={stepsDisabled.duration} {setDuration} {duration} {goToStep} />
	<OtherSettingsStep disabled={stepsDisabled.other} />
</Accordion.Root>
