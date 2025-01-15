<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Accordion from '@/components/ui/accordion';
	import { Button } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { Layers, List, Play } from 'lucide-svelte';

	type DisplayMode = 'cards' | 'list';

	const {
		testId
	}: {
		testId: string;
	} = $props();

	const displayModes: {
		icon: any;
		label: DisplayMode;
	}[] = [
		{
			icon: Layers,
			label: 'cards'
		},
		{
			icon: List,
			label: 'list'
		}
	];

	const durationOptions = [5, 10];

	let testDurationSelected = $state<null | number>(null);
	let displayModeSelected = $state<null | DisplayMode>(null);
	let invalidDurationError = $state<string | null>(null);

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
			testDurationSelected = parsedValue;
		} else {
			invalidDurationError = 'Invalid input.';
		}
	};

	const onTestButtonClick = () => {
		goto(`/test/${testId}/share`);
	
		
	};

	let customDurationInput = $state.raw<null | HTMLInputElement>(null);
</script>

<Dialog.Root open={true}>
	<Dialog.Trigger>
		<Button size="sm" class="gap-x-1">
			Take a test
			<Play size="12" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Test settings</Dialog.Title>
			<Dialog.Description>Change test settings</Dialog.Description>
		</Dialog.Header>
		<!-- <Separator /> -->
		<Accordion.Root>
			<Accordion.Item value="displayMode">
				<Accordion.Trigger class="flex justify-center text-sm font-medium hover:no-underline"
					>Display mode</Accordion.Trigger
				>
				<Accordion.Content>
					<p class="text-center text-xs">
						Select the display mode for the test. The display mode will change how the test
						questions are displayed.
					</p>
					<div class="mt-3 flex flex-col gap-3 text-sm sm:flex-row">
						{#each displayModes as mode}
							<Button
								variant="outline"
								class="{`flex ${displayModeSelected === mode.label ? ' border-black ' : ''} h-24 w-full flex-col items-center justify-center gap-y-2 rounded-md border text-xs font-medium transition-all hover:shadow-sm`}}"
								onclick={() => (displayModeSelected = mode.label)}
							>
								<mode.icon size="24"></mode.icon>
								{mode.label.charAt(0).toUpperCase() + mode.label.slice(1)}
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
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item value="duration">
				<Accordion.Trigger class="flex justify-center text-sm font-medium hover:no-underline">
					Test duration
				</Accordion.Trigger>
				<Accordion.Content>
					<p class="text-center text-xs">
						Select the duration of the test. The test will automatically end after the selected
						duration.
					</p>
					<div class="mt-3 flex flex-col gap-3 text-sm sm:flex-row">
						{#each durationOptions as duration}
							<Button
								variant="outline"
								class="{`flex ${testDurationSelected === duration ? ' border-black ' : ''} h-24 w-full flex-col items-center justify-center gap-y-2 rounded-md border text-xs font-medium transition-all hover:shadow-sm`}}"
								onclick={() => (testDurationSelected = duration)}
							>
								{duration} Minutes
							</Button>
						{/each}
						<button
							onclick={() => customDurationInput?.focus()}
							class={`group flex h-24 w-full ${
								testDurationSelected && !durationOptions.includes(testDurationSelected)
									? 'border-black'
									: ''
							} flex-col items-center justify-center rounded-md border text-xs font-medium outline-none focus:outline-none focus:ring-0`}
						>
							<div class="relative flex">
								<input
									type="number"
									bind:this={customDurationInput}
									value={testDurationSelected || ''}
									oninput={onCustomDurationChange}
									class="w-8 border-b bg-white [appearance:textfield] focus:border-0 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
								/>
								Minutes
								<p class="text-destructive absolute -bottom-4">{invalidDurationError}</p>
							</div>
						</button>
					</div>
				</Accordion.Content>
			</Accordion.Item>
			<Accordion.Item class="border-b-0" value="other-settings">
				<Accordion.Trigger
					class="flex justify-center text-sm font-medium opacity-50 hover:no-underline"
				>
					Other settings
				</Accordion.Trigger>
				<Accordion.Content>
					<p class="text-center text-xs">Here you can change other settings for the test.</p>
				</Accordion.Content>
			</Accordion.Item>
		</Accordion.Root>

		<Dialog.Footer>
			<Button
				onclick={onTestButtonClick}
				disabled={!testDurationSelected ||
					!displayModeSelected ||
					(invalidDurationError !== null && invalidDurationError !== '')}
				size="sm">Test</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
