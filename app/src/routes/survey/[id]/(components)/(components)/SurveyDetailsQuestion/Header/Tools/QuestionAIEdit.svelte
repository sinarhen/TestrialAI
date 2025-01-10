<script lang="ts">
	import * as DropdownMenu from '@/components/ui/dropdown-menu';
	import { Brain, CaseLower, Globe, RotateCw, Sparkles, ChevronDown } from 'lucide-svelte';

	let isActionMenuOpen = $state(false);

	const onToolChoose = <T>(tool: T) => {
		
	}; 
</script>

<DropdownMenu.Root
	closeOnItemClick={true}
	open={isActionMenuOpen}
	onOpenChange={() => (isActionMenuOpen = !isActionMenuOpen)}
>
	<DropdownMenu.Trigger
		class="inline-flex cursor-pointer items-center opacity-25 transition-opacity hover:opacity-75 group-hover:opacity-25 group-hover:hover:opacity-100 lg:opacity-0"
	>
		<Sparkles size="16" />
		<ChevronDown size="12" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="relative w-[200px]">
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Separator />
			<DropdownMenu.Item class="cursor-pointer"
				><RotateCw size="16" class="mr-2" /> Rephrase</DropdownMenu.Item
			>
			<DropdownMenu.Item class="cursor-pointer"
				><Brain size="16" class="mr-2" /> Harder</DropdownMenu.Item
			>
			<DropdownMenu.Item class="cursor-pointer"
				><CaseLower size="16" class="mr-2" />Simplify</DropdownMenu.Item
			>
			<DropdownMenu.Item class="cursor-pointer"
				><Globe size="16" class="mr-2" />Translate</DropdownMenu.Item
			>
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
