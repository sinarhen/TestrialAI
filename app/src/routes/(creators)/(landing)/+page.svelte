<script lang="ts">
	import type { LayoutData } from '../$types';
	import '../../../app.css';
	import Greeting from './components/Greeting.svelte';

	const { data }: { data: LayoutData } = $props();
</script>

<Greeting userName={data.user?.username} />
