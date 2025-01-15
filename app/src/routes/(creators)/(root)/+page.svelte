<script lang="ts">
	import '../../../app.css';
	import type { LayoutData } from '../../$types';
	import Greeting from './components/Greeting.svelte';

	const { data }: { data: LayoutData } = $props();
</script>

<Greeting userName={data.user?.username} />
