<script lang="ts">
	import * as Sheet from '@/components/ui/sheet';
	import { History, Timer, Gauge } from 'lucide-svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
	import { goto } from '$app/navigation';
	import { createQuery } from '@tanstack/svelte-query';
	import { api } from '@/client-api';

	let isSheetOpen = $state(false);

	const onClick = (testId: string) => {
		goto(`/test/${testId}`);
		isSheetOpen = false;
	};

	const user = createQuery(api().users.me());
	const data = user ? createQuery(api().tests.getTestsHistory()) : null;
	const history = $data;
</script>

<Sheet.Root open={isSheetOpen} onOpenChange={(val) => (isSheetOpen = val)}>
	<Sheet.Trigger>
		<History size="16" />
	</Sheet.Trigger>
	<Sheet.Content class="overflow-y-auto" side="left">
		<Sheet.Header>
			<Sheet.Title class="text-xl">Tests history</Sheet.Title>
			<Sheet.Description>View all your past tests</Sheet.Description>
		</Sheet.Header>
		<div class="mt-6 flex flex-col gap-y-4">
			{#if history?.data}
				{#each history.data as test}
					<Card onclick={() => onClick(test.id)} class="cursor-pointer">
						<CardHeader>
							<CardTitle tag="h6">{test.title}</CardTitle>
							<CardDescription class="flex w-full gap-x-2">
								<span class="flex items-center gap-x-1">
									<Timer size="12" /> 10 Minutes
								</span>
								<span class="flex items-center gap-x-1">
									<Gauge size="12" /> Hard
								</span>
							</CardDescription>
						</CardHeader>
						<CardContent class="line-clamp-3 pt-2 text-sm opacity-75">
							{test.description}
						</CardContent>
					</Card>
				{/each}
			{/if}
		</div>
	</Sheet.Content>
</Sheet.Root>
