<script lang="ts">
	import { Button } from '@/components/ui/button';

	const {
		selected,
		onclick,
		children,
		disabled
	}: {
		selected?: boolean;
		onclick?: () => void;
		children?: any;
		disabled?: boolean;
	} = $props();
</script>

<Button
	variant="outline"
	class="{`flex ${selected ? ' border-black ' : ''} h-24 w-full flex-col items-center justify-center gap-y-2 rounded-md border text-xs font-medium transition-all hover:shadow-sm`}}"
	{onclick}
	{disabled}
>
	{@render children()}
</Button>
