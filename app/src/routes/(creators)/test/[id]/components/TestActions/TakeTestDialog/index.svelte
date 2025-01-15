<script module>
	export type Step = keyof typeof steps;

	export const steps = {
		displayMode: { value: 'displayMode', label: 'Display mode' },
		duration: {
			value: 'duration',
			label: 'Test duration'
		},
		other: {
			value: 'other',
			label: 'Other settings'
		}
	} as const;
</script>

<script lang="ts">
	import { goto } from '$app/navigation';
	import * as Accordion from '@/components/ui/accordion';
	import { Button } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { createTestSession } from '@/services/handlers';
	import type { DisplayMode } from '@/types/entities';
	import { Layers, List, Play } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import AccordionStep from './AccordionStep.svelte';
	import DisplayModeStep from './Steps/DisplayModeStep.svelte';
	import DurationPickerStep from './Steps/DurationPickerStep.svelte';

	const {
		testId
	}: {
		testId: string;
	} = $props();

	const testSessionSettings = $state<{
		displayMode: DisplayMode | null;
		durationInMinutes: number | null;
		otherSettings: any | null;
	}>({
		displayMode: null,
		durationInMinutes: null,
		otherSettings: null // currently unused
	});

	const setDisplayMode = (mode: DisplayMode | null) => {
		testSessionSettings.displayMode = mode;
	};

	const setDuration = (duration: number | null) => {
		testSessionSettings.durationInMinutes = duration;
	};

	const onTestButtonClick = () => {
		if (!testSessionSettings.durationInMinutes || !testSessionSettings.displayMode) {
			toast.error('Please select test duration and display mode.');
			return;
		}
		toast.promise(
			createTestSession(testId, {
				displayMode: testSessionSettings.displayMode,
				durationInMinutes: testSessionSettings.durationInMinutes
			}),
			{
				loading: 'Creating test session...',
				success: ({ data: sessionId }) => {
					return 'Test session created.';
				},
				error: 'Failed to create test session.'
			}
		);
	};

	const stepsDisabled: Record<Step, boolean> = {
		displayMode: false,
		duration: !testSessionSettings.displayMode,
		other: !testSessionSettings.durationInMinutes
	};

	type Step = keyof typeof steps;

	let step = $state<Step>('displayMode');

	const isCreateButtonDisabled = $derived(
		!testSessionSettings.durationInMinutes || !testSessionSettings.displayMode
	);

	const goToStep = (step: Step) => {
		step = step;
	};
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
		<Accordion.Root value={step}>
			<DisplayModeStep
				disabled={stepsDisabled.displayMode}
				{setDisplayMode}
				currentDisplayMode={testSessionSettings.displayMode}
				{goToStep}
			/>
			<DurationPickerStep
				disabled={stepsDisabled.duration}
				{setDuration}
				currentDuration={testSessionSettings.durationInMinutes}
				{goToStep}
			/>
			<AccordionStep disabled={stepsDisabled.other} class="border-b-0" {...steps.other}>
				<p class="text-center text-xs">Here you can change other settings for the test.</p>
			</AccordionStep>
		</Accordion.Root>
		<Dialog.Footer>
			<Button onclick={onTestButtonClick} disabled={isCreateButtonDisabled} size="sm">Create</Button
			>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
