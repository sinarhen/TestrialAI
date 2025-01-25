<script lang="ts">
	import '../app.css';
	import { QueryClientProvider } from '@tanstack/svelte-query';
	import { ModeWatcher } from 'mode-watcher';
	import { SvelteQueryDevtools } from '@tanstack/svelte-query-devtools';
	import { Toaster } from '@/components/ui/sonner';
	import type { LayoutData } from './$types';

	const {
		data,
		children
	}: {
		data: LayoutData;
		children: any;
	} = $props();
</script>

<QueryClientProvider client={data.queryClient}>
	<ModeWatcher />
	<main class="antialiased">
		{@render children?.()}
	</main>
	<SvelteQueryDevtools />
</QueryClientProvider>

<Toaster />
