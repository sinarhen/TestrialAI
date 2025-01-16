<script lang="ts">
	import { Button } from '@/components/ui/button';
	import AccordionStep from '../AccordionStep.svelte';
	import { steps, type Step } from '../index.svelte';

	let invalidDurationError = $state<string | null>(null);

	const durationOptions = [5, 10];
	let customDurationInput = $state.raw<null | HTMLInputElement>(null);

	const onCustomDurationChange = (e: Event) => {
		const target = e.target as HTMLInputElement;
		const value = target.value.trim();

		const parsedValue = parseInt(value, 10);

		if (value.length > 2 || parsedValue > 60) {
			invalidDurationError = 'Max 60.';
		} else if (parsedValue < 1) {
			invalidDurationError = 'Min 1.';
		} else if (!isNaN(parsedValue) && parsedValue >= 1 && parsedValue <= 60) {
			invalidDurationError = null;
			setDuration(parsedValue);
		} else {
			invalidDurationError = 'Invalid input.';
		}
	};

	const {
		goToStep,
		setDuration,
		disabled,
		duration
	}: {
		disabled: boolean;
		duration: number | null;
		goToStep: (step: Step) => void;
		setDuration: (duration: number | null) => void;
	} = $props();
</script>

<AccordionStep {disabled} {...steps.duration}>
	<p class="text-center text-xs">
		Select the duration of the test. The test will automatically end after the selected duration.
	</p>
	<div class="mt-3 flex flex-col gap-3 text-sm sm:flex-row">
		{#each durationOptions as durationOption}
			<Button
				variant="outline"
				class="{`flex ${duration === durationOption ? ' border-black ' : ''} h-24 w-full flex-col items-center justify-center gap-y-2 rounded-md border text-xs font-medium transition-all hover:shadow-sm`}}"
				onclick={() => {
					if (durationOption === duration) {
						setDuration(null);
						goToStep('displayMode');
						return;
					}
					setDuration(durationOption);
					goToStep('other');
				}}
			>
				{durationOption} Minutes
			</Button>
		{/each}
		<button
			onclick={() => customDurationInput?.focus()}
			class={`group flex h-24 w-full ${
				duration && !durationOptions.includes(duration) ? 'border-black' : ''
			} flex-col items-center justify-center rounded-md border text-xs font-medium outline-none focus:outline-none focus:ring-0`}
		>
			<div class="relative flex">
				<input
					type="number"
					bind:this={customDurationInput}
					value={duration}
					oninput={onCustomDurationChange}
					class="w-8 border-b bg-white [appearance:textfield] focus:border-0 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
				/>
				Minutes
				<p class="text-destructive absolute -bottom-4">{invalidDurationError}</p>
			</div>
		</button>
	</div>
</AccordionStep>
