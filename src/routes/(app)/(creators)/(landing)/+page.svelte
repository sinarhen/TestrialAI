<script lang="ts">
	import Greeting from './components/Greeting.svelte';
	import '../../../../app.css';
</script>

<Greeting userName={$authedUserQuery.data?.username} />
