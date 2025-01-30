<script lang="ts">
	import Header from './components/Header/Header.svelte';

	let { children } = $props();
</script>

<Header form={null} />
<div class="h-full w-full py-20 pb-12">
	{@render children()}
</div>
