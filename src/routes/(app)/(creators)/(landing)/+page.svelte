<script lang="ts">
	import Greeting from './components/Greeting.svelte';
	import '../../../../app.css';

	const { data } = $props();
</script>

<Greeting userName={data.user?.username} />
