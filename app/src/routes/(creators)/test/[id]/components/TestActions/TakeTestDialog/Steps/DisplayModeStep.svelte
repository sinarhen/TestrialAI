<script lang="ts">
	import { type DisplayMode } from '@/types/entities';
	import { Button } from '@/components/ui/button';

	import AccordionStep from '../AccordionStep.svelte';
	import { Layers, List } from 'lucide-svelte';
	import { steps, type Step } from '../index.svelte';

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
</script>

<AccordionStep {disabled} {label} {value}>
	<p class="text-center text-xs">
		Select the display mode for the test. The display mode will change how the test questions are
		displayed.
	</p>
	<div class="mt-3 flex flex-col gap-3 text-sm sm:flex-row">
		{#each displayModes as mode}
			<Button
				variant="outline"
				class="{`flex ${currentDisplayMode === mode.value ? ' border-black ' : ''} h-24 w-full flex-col items-center justify-center gap-y-2 rounded-md border text-xs font-medium transition-all hover:shadow-sm`}}"
				onclick={() => {
					if (currentDisplayMode === mode.value) {
						setDisplayMode(null);
						return;
					}
					setDisplayMode(mode.value);
					goToStep('duration');
				}}
			>
				<mode.icon size="24"></mode.icon>
				{mode.value.charAt(0).toUpperCase() + mode.value.slice(1)}
			</Button>
		{/each}
		<Button
			variant="outline"
			disabled
			class="flex h-24 w-full flex-col items-center justify-center gap-y-2 rounded-md border text-xs font-medium transition-all hover:shadow-sm"
		>
			<Layers size="24"></Layers>
			Coming soon
		</Button>
	</div>
</AccordionStep>
