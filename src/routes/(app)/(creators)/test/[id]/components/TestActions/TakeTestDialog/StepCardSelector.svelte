<script lang="ts">
	import { Button } from '@client/components/ui/button';
	import { cn } from '@/client/utils/shadcn';

	const {
		selected,
		onclick,
		children,
		disabled,
		class: className
	}: {
		selected?: boolean;
		onclick?: () => void;
		children?: any;
		disabled?: boolean;
		class?: string;
	} = $props();
</script>

<Button
	variant="outline"
	class={cn(
		`flex h-24 w-full flex-col items-center justify-center gap-y-2 rounded-md border text-xs font-medium transition-all hover:shadow-sm`,
		selected ? ' border-black' : undefined,
		className
	)}
	{onclick}
	{disabled}
>
	{@render children()}
</Button>
