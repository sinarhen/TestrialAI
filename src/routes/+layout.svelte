<script lang="ts">
	import '../app.css';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '@client/components/ui/sonner';
	import type { LayoutData } from './$types';

	const {
		data,
		children
	}: {
		data: LayoutData;
		children: any;
	} = $props();
</script>

<ModeWatcher />
<main class="antialiased">
	{@render children?.()}
</main>

<Toaster />
