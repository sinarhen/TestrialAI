<script lang="ts">
	import '../app.css';
	import { Toaster } from '$lib/components/ui/sonner';
	import Header from './(components)/Header/Header.svelte';

	import type { ActionData } from './(root)/$types';
	import type { LayoutData } from './$types';

	let { data, form, children }: { data: LayoutData; form: ActionData; children: any } = $props();
</script>

<div
	class="h-auto min-h-screen w-full bg-gradient-to-b from-white via-pink-100 via-30% to-yellow-50 px-20 pb-20 md:px-40 lg:px-60"
>
	<Header {data} {form} />
	<div class="h-full w-full py-20 pb-12">
		{@render children()}
	</div>
</div>

<Toaster />
