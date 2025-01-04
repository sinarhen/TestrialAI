<script lang="ts">
	import '../../app.css';
	import Greeting from './components/Greeting.svelte';
	import type { PageServerData } from './$types';

	const { data }: { data: PageServerData } = $props();
</script>

<Greeting userName={data.user?.username} />
