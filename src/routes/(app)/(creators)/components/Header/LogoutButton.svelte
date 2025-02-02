<script lang="ts">
	import { applyAction, enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { api } from '@/client-api';

	const onLogout = async () => {
		try {
			const resp = await api().iam.logout.$post();

			if (resp.ok) {
				toast.success('Logged out successfully');
				invalidateAll();
			} else {
				toast.error('Failed to log out');
			}
		} catch (err) {
			toast.error('Something went wrong');
		}
	};

	const {
		children
	}: {
		children: any;
	} = $props();
</script>

<button onclick={onLogout}>
	{#if children}
		{@render children()}
	{/if}
</button>
