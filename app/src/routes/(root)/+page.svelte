<script lang="ts">
	import '../../app.css';
	import Greeting from './(components)/Greeting.svelte';
	import type { LayoutData } from '../$types';

	const { data }: { data: LayoutData } = $props();
</script>

<Greeting userName={data.user?.username} />
