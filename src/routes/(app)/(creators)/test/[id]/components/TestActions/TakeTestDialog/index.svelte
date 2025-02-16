<script module lang="ts">
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

	export type DialogState =
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
		  };
	export type DialogStateStatus = DialogState['status'];
</script>

<script lang="ts">
	import { createQrPngDataUrl } from '@svelte-put/qr';

	import { browser } from '$app/environment';

	import * as Accordion from '@client/components/ui/accordion';
	import { Button } from '@client/components/ui/button';
	import * as Dialog from '@client/components/ui/dialog';
	import { Copy, Layers, Play, Settings, Share, Timer } from 'lucide-svelte';
	import Separator from '@client/components/ui/separator/separator.svelte';
	import { Input } from '@client/components/ui/input';
	import { copy } from '@/client/utils/copy';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import QR from '@svelte-put/qr/svg/QR.svelte';
	import StepCardSelector from './StepCardSelector.svelte';
	import ConfigureSession from './DialogStates/SessionConfiguringSteps/index.svelte';
	import ConfirmingState from './DialogStates/ConfirmingState.svelte';
	import type { DisplayMode } from '@/shared/constants/display-modes';

	const {
		testId,
		testTitle
	}: {
		testId: string;
		testTitle: string;
	} = $props();

	const testSettings = $state({
		displayMode: null as DisplayMode | null,
		durationInMinutes: null as number | null
	});
	let dialogState = $state<DialogState>({
		status: 'configuring'
	});

	const setDisplayMode = (mode: DisplayMode | null) => {
		testSettings.displayMode = mode;
	};

	const setDuration = (duration: number | null) => {
		testSettings.durationInMinutes = duration;
	};

	const onCreateButtonClick = () => {
		dialogState = {
			status: 'confirming'
		};
	};

	const isCreateButtonDisabled = $derived(
		!testSettings.durationInMinutes || !testSettings.displayMode
	);

	const setDialogState = (state: DialogState) => {
		dialogState = state;
	};

	const getSessionLink = (code: string) => {
		return `${window.location.origin}/session/${code}`;
	};

	const shareQr = async () => {
		if (dialogState.status !== 'created') {
			return;
		}
		const qrImage = await createQrPngDataUrl({
			data: getSessionLink(dialogState.code),
			width: 300,
			height: 300,
			backgroundFill: '#fff',
			anchorInnerFill: 'pink',
			shape: 'circle'
		});
		const blob = await fetch(qrImage).then((res) => res.blob());
		const qrImageFile = new File([blob], 'qr.png', { type: blob.type });
		if (navigator.share && navigator.canShare && navigator.canShare({ files: [qrImageFile] })) {
			navigator.share({
				files: qrImageFile ? [qrImageFile] : undefined
			});
		} else {
			toast.error('Your browser does not support sharing files.');
		}
	};

	const shareLink = async () => {
		if (dialogState.status !== 'created') {
			return;
		}
		if (
			navigator.share &&
			navigator.canShare &&
			navigator.canShare({ url: getSessionLink(dialogState.code) })
		) {
			navigator.share({
				text: `Join the test session for ${testTitle} at ${getSessionLink(dialogState.code)}`,
				title: testTitle,
				url: getSessionLink(dialogState.code)
			});
		} else {
			toast.error('Your browser does not support sharing links.');
		}
	};
</script>

<Dialog.Root>
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
			<ConfigureSession
				{setDisplayMode}
				{setDuration}
				duration={testSettings.durationInMinutes}
				displayMode={testSettings.displayMode}
			/>
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
						{testSettings.displayMode ?? 'cards'}
					</StepCardSelector>
					<StepCardSelector class="motion-opacity-in-0 motion-delay-200">
						<Timer size="24" />
						<p>{testSettings.durationInMinutes ?? 10} Minutes</p>
					</StepCardSelector>
					<StepCardSelector class="motion-opacity-in-0 motion-delay-300"
						>No other settings</StepCardSelector
					>
				</div>
			</div>
			<Separator />

			{#if dialogState.status === 'confirming' && testSettings.displayMode && testSettings.durationInMinutes}
				<ConfirmingState
					testSettings={{
						displayMode: testSettings.displayMode,
						durationInMinutes: testSettings.durationInMinutes
					}}
					{setDialogState}
					{testId}
				/>
			{:else if dialogState.status === 'creating'}
				<div
					class="flex h-48 flex-col items-center justify-center px-24 -motion-translate-y-in-[10%] motion-opacity-in-0"
				>
					<h1 class="text-sm">Creating...</h1>
					<p class="text-xs">Please wait while we create the test session.</p>
				</div>
			{:else if dialogState.status === 'created'}
				<div>
					<div class="flex justify-between gap-x-3">
						<div>
							<h1 class="text-center font-semibold -motion-translate-y-in-25 motion-opacity-in-0">
								19:00 25/01/2024
							</h1>
							<p class="text-center text-xs motion-opacity-in motion-delay-200">Start time</p>
						</div>
					</div>
					<div class="mt-5 flex gap-x-2">
						<div class="h-full w-1/2">
							<button
								onclick={shareQr}
								class="h-full w-full rounded border p-2 -motion-translate-y-in-[10%] motion-opacity-in-0 motion-delay-200"
							>
								{#if browser}
									<QR
										anchorInnerFill="pink"
										shape="circle"
										class="h-full w-full"
										data={getSessionLink(dialogState.code)}
									/>
								{/if}
							</button>
							<p class="mt-2 text-center text-xs motion-opacity-in-0 motion-delay-[300ms]">
								Click to share
							</p>
						</div>

						<Separator class="mx-2" orientation="vertical" />
						<div class="flex w-full flex-col">
							<div class="relative mt-1 flex w-[120px] motion-opacity-in-0 motion-delay-500">
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

							<div class="relative mt-2 motion-opacity-in-0 motion-delay-[550ms]">
								<Button
									size="icon"
									class="absolute bottom-0 right-1.5 top-0 z-10 m-auto size-7 p-2"
									variant="ghost"
								>
									<Copy class="h-full w-full" />
								</Button>
								<Input
									disabled
									value={browser ? getSessionLink(dialogState.code) : null}
									class="w-full text-sm disabled:opacity-100"
								/>
							</div>
							<p class="ml-1 mt-1 text-xs motion-opacity-in-0 motion-delay-[600ms]">
								Link to invite participants to the test.
							</p>
							<div class="mt-3.5 flex flex-col gap-1 sm:flex-row">
								<Button
									onclick={() => (browser ? goto(`/session/${dialogState.code}`) : null)}
									size="sm"
									class="flex items-center gap-x-1 -motion-translate-y-in-25 motion-opacity-in-0 motion-delay-[650ms]"
								>
									<Play size="12" />
									View session
								</Button>
								<Button
									onclick={shareLink}
									size="sm"
									variant="outline"
									class="flex items-center gap-x-1 -motion-translate-y-in-25 motion-opacity-in-0 motion-delay-700"
								>
									<Share size="12" />
									Share link
								</Button>
							</div>
						</div>
					</div>
				</div>
			{/if}
		{/if}
	</Dialog.Content>
</Dialog.Root>
