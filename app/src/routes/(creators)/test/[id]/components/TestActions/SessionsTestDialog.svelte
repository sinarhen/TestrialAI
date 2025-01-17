<script lang="ts">
	import { Button } from '@/components/ui/button';
	import type { TestSession } from '@/types/entities';
	import { Circle, FileClock, User } from 'lucide-svelte';
	import * as Dialog from '@/components/ui/dialog';
	import * as Accordion from '@/components/ui/accordion';

	const {
		sessions
	}: {
		sessions?: TestSession[];
	} = $props();
</script>

<Dialog.Root open={true}>
	<Dialog.Trigger>
		<Button size="sm" class="flex gap-x-1" variant="outline"
			>Sessions
			<FileClock size="12" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Sessions</Dialog.Title>
			<Dialog.Description>View and manage test sessions</Dialog.Description>
		</Dialog.Header>
		<div class="flex flex-col gap-y-2">
			<Button variant="outline" class="block h-full rounded-md border p-4">
				<div class="flex items-center justify-between gap-x-2">
					<h2 class="text-sm font-medium">Session name</h2>
					<span class="text-xs">Active</span>
				</div>
				<div class="flex items-center gap-x-4 text-xs">
					<span class="flex items-center gap-x-0.5">
						<User size="12" />
						10
					</span>
					<span class="flex items-center gap-x-0.5">
						<Circle size="12" />
						7.2/10
					</span>
				</div>
			</Button>
			<Button variant="outline" class="block h-full rounded-md border p-4">
				<div class="flex items-center justify-between gap-x-2">
					<h2 class="text-sm font-medium">Session name</h2>
					<span class="text-xs">Ended</span>
				</div>
				<div class="flex items-center gap-x-4 text-xs">
					<span class="flex items-center gap-x-0.5">
						<User size="12" />
						10
					</span>
					<span class="flex items-center gap-x-0.5">
						<Circle size="12" />
						7.2/10
					</span>
				</div>
			</Button><Button variant="outline" class="block h-full rounded-md border p-4">
				<div class="flex items-center justify-between gap-x-2">
					<h2 class="text-sm font-medium">Session name</h2>
					<span class="text-xs">Active</span>
				</div>
				<div class="flex items-center gap-x-4 text-xs">
					<span class="flex items-center gap-x-0.5">
						<User size="12" />
						10
					</span>
					<span class="flex items-center gap-x-0.5">
						<Circle size="12" />
						7.2/10
					</span>
				</div>
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
