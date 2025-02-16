<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { invalidateAll } from '$app/navigation';
	import { api } from '@/client/api';
	import { parseClientResponse } from '@/client/utils/api';

	const onLogout = async () => {
		const resp = await api().iam.logout.$post().then(parseClientResponse);

		if (!resp.error) {
			toast.success('Logged out successfully');
			invalidateAll();
		} else {
			toast.error(resp.error);
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
