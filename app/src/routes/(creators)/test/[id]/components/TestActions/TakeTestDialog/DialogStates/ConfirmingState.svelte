<script lang="ts">
	import Button from '@/components/ui/button/button.svelte';
	import { createTestSession } from '@/services/handlers';
	import type { DisplayMode } from '@/types/entities';
	import { toast } from 'svelte-sonner';

	const {
		setDialogState,
		displayMode,
		durationInMinutes,
		testId
	}: {
		setDialogState: (status: string) => void;
		testId: string;
		displayMode: DisplayMode;
		durationInMinutes: number;
	} = $props();

	const onConfirm = async () => {
		if (!durationInMinutes || !displayMode) {
			toast.error('Please select test duration and display mode.');
			return;
		}
		try {
			setDialogState({
				status: 'creating'
			});

			const { data: code } = await createTestSession(testId, {
				displayMode: testSettings.displayMode,
				durationInMinutes: testSettings.durationInMinutes
			});

			setDialogState({
				status: 'created',
				code
			});
		} catch (error) {
			setDialogState('configuring');
			toast.error('Failed to create test session.');
			console.error(error);
		}
	};

	const onCancel = () => setDialogState('configuring');
</script>

<div
	class="-motion-translate-y-in-[10%] motion-opacity-in-0 motion-delay-[400ms] flex h-48 flex-col items-center justify-center px-24"
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
