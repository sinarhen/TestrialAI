<script>
	import { Button } from '@client/components/ui/button';
	import { Settings } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
</script>

<Button
	variant="outline"
	size="sm"
	class="gap-x-1 -motion-translate-y-in-50 motion-opacity-in-0  motion-duration-500"
	onclick={() => {
		toast.info('Not implemented yet');
	}}>Settings <Settings size="12" /></Button
>
