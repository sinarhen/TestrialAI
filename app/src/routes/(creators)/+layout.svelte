<script lang="ts">
	import '../../app.css';
	import type { LayoutData, LayoutServerData } from './$types';
	import type { ActionData } from './(root)/$types';
	import Header from './components/Header/Header.svelte';

	let { data, form, children }: { data: LayoutData; form: ActionData; children: any } = $props();

	console.log(data);
</script>

<Header {data} {form} />
<div class="h-full w-full py-20 pb-12">
	{@render children()}
</div>
