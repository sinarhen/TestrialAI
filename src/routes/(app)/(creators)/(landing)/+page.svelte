<script lang="ts">
	import { createQuery } from '@tanstack/svelte-query';
	import Greeting from './components/Greeting.svelte';
	import { api } from '@/tanstack-query';
	import '../../../../app.css';
	const authedUserQuery = createQuery(api().users.me());
</script>

<Greeting userName={$authedUserQuery.data?.username} />
