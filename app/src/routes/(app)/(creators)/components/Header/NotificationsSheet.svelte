<script lang="ts">
	import * as Sheet from '@/components/ui/sheet';
	import { Bell } from 'lucide-svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
</script>

<Sheet.Root>
	<Sheet.Trigger>
		<div class="relative cursor-pointer">
			<Bell size="16" />
			<span class="absolute -right-0.5 bottom-0 size-2 rounded-full bg-red-500 px-1 text-white"
			></span>
		</div>
	</Sheet.Trigger>
	<Sheet.Content class="overflow-y-auto" side="right">
		<Sheet.Header>
			<Sheet.Title class="text-xl">Notifications</Sheet.Title>
			<Sheet.Description>View all your notifications</Sheet.Description>
		</Sheet.Header>
		<div class="mt-6 flex flex-col gap-y-4">
			{#each Array.from({ length: 5 }, (_, i) => i) as _}
				<Card class="cursor-pointer">
					<CardHeader>
						<CardTitle tag="h6">Logged In</CardTitle>
						<CardDescription class="flex w-full gap-x-2">12/04/2024 12:00</CardDescription>
					</CardHeader>
					<CardContent class="line-clamp-3 pt-2 text-sm opacity-75"></CardContent>
				</Card>
			{/each}
		</div>
	</Sheet.Content>
</Sheet.Root>
