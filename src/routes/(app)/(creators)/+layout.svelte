<script lang="ts">
	import Header from './components/Header/Header.svelte';

	let { children, data } = $props();
</script>

<Header user={data.user} />
<div class="h-full w-full py-20 pb-12">
	{@render children()}
</div>
