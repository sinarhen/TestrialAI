<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';

	let isLoggingOutInProgress = $state(false);

	const onLogout: SubmitFunction = () => {
		isLoggingOutInProgress = true;
		return async ({ result }) => {
			switch (result.type) {
				case 'success':
					toast.success('Successfully logged out');
					await applyAction(result);
					await invalidateAll();
					break;
				case 'error':
					toast.error(result.error);
					break;
				case 'failure':
					if (result.data && typeof result.data === 'object') {
						toast.error(
							Object.entries(result.data)
								.map(([key, value]) => `${key}: ${value}`)
								.join('\n')
						);
					} else {
						toast.error('An unknown error occurred');
					}
					break;
				default:
					toast.warning('Something went wrong. Please try reloading the page.');
					break;
			}
			isLoggingOutInProgress = false;
		};
	};

	const {
		children
	}: {
		children: any;
	} = $props();
</script>

<form use:enhance={onLogout} method="POST" action="/auth?/logout">
	{#if children}
		{@render children()}
	{/if}
</form>
