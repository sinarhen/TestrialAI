<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import { Button } from '@client/components/ui/button';

	const {
		onCreateQuestion
	}: {
		onCreateQuestion: () => void;
	} = $props();
</script>

<Button
	size="sm"
	onclick={onCreateQuestion}
	variant="outline"
	class="flex w-full items-center justify-center gap-x-1 rounded-r-none"
>
	<Plus size="16" />
	Add question
</Button>
