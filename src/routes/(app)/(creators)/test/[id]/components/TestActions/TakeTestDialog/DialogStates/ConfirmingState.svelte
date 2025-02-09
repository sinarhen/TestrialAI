<script lang="ts">
	import { parseClientResponse } from '@/utils/api.js';
	import Button from '@/components/ui/button/button.svelte';
	import { toast } from 'svelte-sonner';
	import { type DialogState } from '../index.svelte';
	import { api } from '@/client-api';
	import type { DisplayMode } from '@/constants/display-modes';

	const {
		setDialogState,
		testSettings,
		testId
	}: {
		setDialogState: (state: DialogState) => void;
		testId: string;
		testSettings: {
			durationInMinutes: number;
			displayMode: DisplayMode;
		};
	} = $props();
	const { durationInMinutes, displayMode } = testSettings;

	const onConfirm = async () => {
		if (!durationInMinutes || !displayMode) {
			toast.error('Please select test duration and display mode.');
			return;
		}
		try {
			setDialogState({
				status: 'creating'
			});

			const resp = await api()
				['test-sessions'].$post({
					json: {
						testId,
						durationInMinutes,
						displayMode
					}
				})
				.then(parseClientResponse);

			if (!resp) {
				console.debug(
					'No data returned from the API after creating a test session but no error was thrown.'
				);
				return;
			}

			if (resp.error) {
				toast.error(resp.error);
				return;
			}

			setDialogState({
				status: 'created',
				code: resp.data.code
			});
		} catch (error) {
			setDialogState({
				status: 'configuring'
			});
			toast.error('Failed to create test session.');
			console.error(error);
		}
	};

	const onCancel = () => setDialogState({ status: 'configuring' });
</script>

<div
	class="flex h-48 flex-col items-center justify-center px-24 -motion-translate-y-in-[10%] motion-opacity-in-0 motion-delay-[400ms]"
>
	<h1 class=" text-sm">Are you sure?</h1>
	<p class="mt-0.5 text-center text-xs">
		Please confirm that you want to create the test session with the following settings.
	</p>

	<div class="just mt-2.5 flex justify-center gap-x-2">
		<Button onclick={onConfirm} size="sm" class="flex items-center gap-x-1">Create</Button>
		<Button onclick={onCancel} size="sm" variant="outline" class="flex items-center gap-x-1">
			Cancel
		</Button>
	</div>
</div>
