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
	import * as Accordion from '@/components/ui/accordion';
	import { Button } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import type { DisplayMode } from '@/types/entities';
	import { Copy, Layers, Play, QrCode, Settings, Timer } from 'lucide-svelte';
	import DisplayModeStep from './Steps/DisplayModeStep.svelte';
	import DurationPickerStep from './Steps/DurationPickerStep.svelte';
	import OtherSettingsStep from './Steps/OtherSettingsStep.svelte';
	import StepCardSelector from './Steps/StepCardSelector.svelte';
	import Separator from '@/components/ui/separator/separator.svelte';
	import Progress from '@/components/ui/progress/progress.svelte';
	import { Input } from '@/components/ui/input';
	import { copy } from '@/utils/copy';

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
		otherSettings: null
	});

	const setDisplayMode = (mode: DisplayMode | null) => {
		testSessionSettings.displayMode = mode;
	};

	const setDuration = (duration: number | null) => {
		testSessionSettings.durationInMinutes = duration;
	};

	const onCreateButtonClick = () => {
		stage = true;
		// if (!testSessionSettings.durationInMinutes || !testSessionSettings.displayMode) {
		// 	toast.error('Please select test duration and display mode.');
		// 	return;
		// }
		// toast.promise(
		// 	createTestSession(testId, {
		// 		displayMode: testSessionSettings.displayMode,
		// 		durationInMinutes: testSessionSettings.durationInMinutes
		// 	}),
		// 	{
		// 		loading: 'Creating test session...',
		// 		success: ({ data: sessionId }) => {
		// 			return 'Test session created.';
		// 		},
		// 		error: 'Failed to create test session.'
		// 	}
		// );
	};

	const stepsDisabled: Record<Step, boolean> = $derived({
		displayMode: false,
		duration: !testSessionSettings.displayMode,
		other: !testSessionSettings.durationInMinutes
	});

	let currentStep = $state<Step>('displayMode');

	const isCreateButtonDisabled = $derived(
		!testSessionSettings.durationInMinutes || !testSessionSettings.displayMode
	);

	const goToStep = (toStep: Step) => {
		currentStep = toStep;
	};

	let stage = $state();

	const testLink = 'https://surveyapp.co/sessions/9X4EKZ';
	const testCode = '9X4EKZ';
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
		{#if stage}
			<Accordion.Root value={currentStep}>
				<DisplayModeStep
					disabled={stepsDisabled.displayMode}
					{setDisplayMode}
					currentDisplayMode={testSessionSettings.displayMode}
					{goToStep}
				/>
				<DurationPickerStep
					disabled={stepsDisabled.duration}
					{setDuration}
					duration={testSessionSettings.durationInMinutes}
					{goToStep}
				/>
				<OtherSettingsStep disabled={stepsDisabled.other} />
			</Accordion.Root>

			<Dialog.Footer>
				<Button onclick={onCreateButtonClick} disabled={isCreateButtonDisabled} size="sm"
					>Create</Button
				>
			</Dialog.Footer>
		{:else}
			<div>
				<div class="flex gap-x-3 text-xs">
					<StepCardSelector disabled>
						<Layers size="24" />
						{testSessionSettings.displayMode ?? 'cards'}
					</StepCardSelector>
					<StepCardSelector disabled>
						<Timer size="24" />
						<p>{testSessionSettings.displayMode ?? 10} Minutes</p>
					</StepCardSelector>
					<StepCardSelector disabled>No other settings</StepCardSelector>
				</div>
			</div>
			<Separator />
			<div class="flex flex-col items-center px-24 py-8">
				<h1 class="text-sm">Creating...</h1>
				<p class="text-xs">Please wait while we create the test session.</p>
				<Progress value={33} class="mt-2 " />
			</div>
			<Separator />
			<div>
				<h1 class="text-center font-semibold">29:32</h1>
				<p class="text-center text-xs">Remaining time</p>
				<div class="mt-5 flex gap-x-2">
					<div class="h-full w-1/2">
						<QrCode class="h-full w-full" />
					</div>
					<Separator class="mx-2" orientation="vertical" />
					<div class="flex w-full flex-col">
						<div class="relative mt-1 flex w-[120px]">
							<Button
								onclick={() => copy(testLink)}
								size="icon"
								class="absolute bottom-0 right-1.5 top-0 m-auto size-7 p-2"
								variant="ghost"
							>
								<Copy />
							</Button>
							<Input disabled value={testCode} class="w-full text-base disabled:opacity-100" />
						</div>

						<div class="relative mt-2">
							<Button
								size="icon"
								class="absolute bottom-0 right-1.5 top-0 z-10 m-auto size-7 p-2"
								variant="ghost"
							>
								<Copy class="h-full w-full" />
							</Button>
							<Input disabled value={testLink} class="w-full text-sm disabled:opacity-100" />
						</div>
						<p class="ml-1 mt-1 text-xs">Link to invite participants to the test.</p>
						<div class="mt-3.5 flex flex-col gap-1 sm:flex-row">
							<Button size="sm" class="flex items-center gap-x-1">
								<Play size="12" />
								Join
							</Button>
							<Button size="sm" variant="outline" class="flex items-center gap-x-1">
								<Settings size="12" />
								Configure
							</Button>
						</div>
					</div>
				</div>
			</div>
			<!-- <Separator />
			<p class="text-center text-xs">
				Note: You can later change the test settings from the test settings page.
			</p> -->
		{/if}
	</Dialog.Content>
</Dialog.Root>
