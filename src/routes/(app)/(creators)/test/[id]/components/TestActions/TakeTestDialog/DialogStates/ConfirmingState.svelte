<script lang="ts">
	import Button from '@/components/ui/button/button.svelte';
	import { toast } from 'svelte-sonner';
	import { testSettings, type DialogState } from '../index.svelte';

	const {
		setDialogState,
		testId
	}: {
		setDialogState: (state: DialogState) => void;
		testId: string;
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

			// const { data: code } = await createTestSession(testId, {
			// 	displayMode: testSettings.displayMode,
			// 	durationInMinutes: testSettings.durationInMinutes
			// });

			setDialogState({
				status: 'created',
				code: 'asdasd'
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
