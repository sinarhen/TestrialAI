<script module>
	import { browser } from '$app/environment';
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
	import { Copy, Layers, Play, Plus, QrCode, Settings, Timer, X } from 'lucide-svelte';
	import DisplayModeStep from './Steps/DisplayModeStep.svelte';
	import DurationPickerStep from './Steps/DurationPickerStep.svelte';
	import OtherSettingsStep from './Steps/OtherSettingsStep.svelte';
	import StepCardSelector from './Steps/StepCardSelector.svelte';
	import Separator from '@/components/ui/separator/separator.svelte';
	import { Input } from '@/components/ui/input';
	import { copy } from '@/utils/copy';
	import { toast } from 'svelte-sonner';
	import { createTestSession } from '@/services/handlers';
	import { goto } from '$app/navigation';

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
		if (!testSessionSettings.durationInMinutes || !testSessionSettings.displayMode) {
			toast.error('Please select test duration and display mode.');
			return;
		}
		dialogState = {
			status: 'confirming'
		};
	};

	const stepsDisabled: Record<Step, boolean> = $derived({
		displayMode: false,
		duration: !testSessionSettings.displayMode,
		other: !testSessionSettings.durationInMinutes || !testSessionSettings.displayMode
	});

	let currentStep = $state<Step>('displayMode');

	const isCreateButtonDisabled = $derived(
		!testSessionSettings.durationInMinutes || !testSessionSettings.displayMode
	);

	const goToStep = (toStep: Step) => {
		currentStep = toStep;
	};

	let dialogState = $state<
		| { status: 'configuring' }
		| {
				status: 'confirming';
		  }
		| {
				status: 'creating';
		  }
		| {
				status: 'created';
				code: string;
		  }
	>({
		status: 'configuring'
	});

	const confirmCreating = async () => {
		if (!testSessionSettings.durationInMinutes || !testSessionSettings.displayMode) {
			toast.error('Please select test duration and display mode.');
			return;
		}
		try {
			dialogState.status = 'creating';
			const { data: code } = await createTestSession(testId, {
				displayMode: testSessionSettings.displayMode,
				durationInMinutes: testSessionSettings.durationInMinutes
			});

			dialogState = {
				status: 'created',
				code
			};
		} catch (error) {
			dialogState.status = 'configuring';
			toast.error('Failed to create test session.');
			console.error(error);
		}
	};

	const cancelCreating = () => {
		dialogState = {
			status: 'configuring'
		};
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
		{#if dialogState.status === 'configuring'}
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
					<StepCardSelector class="motion-opacity-in-0 motion-delay-100">
						<Layers size="24" />
						{testSessionSettings.displayMode ?? 'cards'}
					</StepCardSelector>
					<StepCardSelector class="motion-opacity-in-0 motion-delay-200">
						<Timer size="24" />
						<p>{testSessionSettings.durationInMinutes ?? 10} Minutes</p>
					</StepCardSelector>
					<StepCardSelector class="motion-opacity-in-0 motion-delay-300"
						>No other settings</StepCardSelector
					>
				</div>
			</div>
			<Separator />

			{#if dialogState.status === 'confirming'}
				<div
					class="motion-opacity-in-0 -motion-translate-y-in-[10%] motion-delay-[400ms] flex h-48 flex-col items-center justify-center px-24"
				>
					<h1 class=" text-sm">Are you sure?</h1>
					<p class="mt-0.5 text-center text-xs">
						Please confirm that you want to create the test session with the following settings.
					</p>

					<div class="just mt-2.5 flex justify-center gap-x-2">
						<Button onclick={confirmCreating} size="sm" class="flex items-center gap-x-1">
							Create
						</Button>
						<Button
							onclick={cancelCreating}
							size="sm"
							variant="outline"
							class="flex items-center gap-x-1"
						>
							Cancel
						</Button>
					</div>
				</div>
			{:else if dialogState.status === 'creating'}
				<div
					class="motion-opacity-in-0 -motion-translate-y-in-[10%] flex h-48 flex-col items-center justify-center px-24"
				>
					<h1 class="text-sm">Creating...</h1>
					<p class="text-xs">Please wait while we create the test session.</p>
				</div>
			{:else if dialogState.status === 'created'}
				<div>
					<h1 class="-motion-translate-y-in-25 motion-opacity-in-0 text-center font-semibold">
						29:32
					</h1>
					<p class="motion-opacity-in motion-delay-200 text-center text-xs">Remaining time</p>
					<div class="mt-5 flex gap-x-2">
						<div
							class="motion-delay-200 -motion-translate-y-in-[10%] motion-opacity-in-0 h-full w-1/2"
						>
							<QrCode class="h-full w-full" />
						</div>
						<Separator class="mx-2" orientation="vertical" />
						<div class="flex w-full flex-col">
							<div class="motion-opacity-in-0 motion-delay-500 relative mt-1 flex w-[120px]">
								<Button
									onclick={() => (dialogState.status === 'created' ? copy(dialogState.code) : null)}
									size="icon"
									class="absolute bottom-0 right-1.5 top-0 m-auto size-7 p-2"
									variant="ghost"
								>
									<Copy />
								</Button>
								<Input
									disabled
									value={dialogState.code}
									class="w-full text-base disabled:opacity-100"
								/>
							</div>

							<div class="motion-opacity-in-0 motion-delay-[550ms] relative mt-2">
								<Button
									size="icon"
									class="absolute bottom-0 right-1.5 top-0 z-10 m-auto size-7 p-2"
									variant="ghost"
								>
									<Copy class="h-full w-full" />
								</Button>
								<Input
									disabled
									value={browser ? `${window.location.origin}/sessions/${dialogState.code}` : null}
									class="w-full text-sm disabled:opacity-100"
								/>
							</div>
							<p class="motion-opacity-in-0 motion-delay-[600ms] ml-1 mt-1 text-xs">
								Link to invite participants to the test.
							</p>
							<div class="mt-3.5 flex flex-col gap-1 sm:flex-row">
								<Button
									onclick={() => goto(`/sessions/${dialogState.code}`)}
									size="sm"
									class="motion-opacity-in-0 -motion-translate-y-in-25 motion-delay-[650ms] flex items-center gap-x-1"
								>
									<Play size="12" />
									Join
								</Button>
								<Button
									size="sm"
									variant="outline"
									class="motion-opacity-in-0 -motion-translate-y-in-25 motion-delay-700 flex items-center gap-x-1"
								>
									<Settings size="12" />
									Configure
								</Button>
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</Dialog.Content>
</Dialog.Root>
