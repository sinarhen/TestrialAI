<script lang="ts">
	import { Button } from '@/components/ui/button';
	import type { TestSession } from '@/types/entities';
	import {
		ArrowUpRight,
		Circle,
		Copy,
		ExternalLink,
		FileClock,
		Play,
		QrCode,
		Settings,
		Trash,
		User
	} from 'lucide-svelte';
	import * as Dialog from '@/components/ui/dialog';
	import * as Accordion from '@/components/ui/accordion';
	import Separator from '@/components/ui/separator/separator.svelte';
	import { Input } from '@/components/ui/input';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { copy } from '@/utils/copy';

	const {
		sessions
	}: {
		sessions?: TestSession[];
	} = $props();

	const calculateAverageScore = (participants: TestSession['participants']) => {
		const finishedParticipants = participants.filter(
			(participant) => participant.status === 'completed'
		);

		const totalScore = finishedParticipants.reduce((prev, curr) => prev + curr.score, 0);
		return totalScore / finishedParticipants.length;
	};
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
		{#if !!sessions?.length}
			<div class="flex flex-col gap-y-2">
				{#each sessions as session}
					<div class="block h-full w-full rounded-md border p-4">
						<div class="flex w-full items-end justify-between">
							<div>
								<h2 class="mt-1 flex w-full gap-x-1 text-start text-sm font-medium">
									{session.testStateJson.title}
								</h2>
							</div>
							<div class="flex items-center gap-x-1 text-lg uppercase">
								{session.code}
								<Button
									onclick={() => copy(session.code)}
									variant="ghost"
									class="size-7"
									size="icon"
								>
									<Copy size="14" />
								</Button>
							</div>
						</div>
						<Separator class="my-3" />
						<div class="flex justify-between">
							<div class="flex gap-x-3 text-sm">
								<span class="flex items-center gap-x-1">
									<Circle fill={!session.endTime ? 'green' : 'red'} size="12" />
									{!session.endTime ? 'Active' : 'Finished'}
								</span>
								<span class="flex items-center gap-x-1">
									<User strokeWidth={2.5} size="14" />
									{session.participants.length}
								</span>
							</div>

							<div class="flex justify-end gap-x-1">
								<Button class="h-8 px-3 text-xs" variant="outline" size="sm">Details</Button>

								<Button class="h-8 px-3 text-xs" variant="outline" size="sm">Configure</Button>

								<Button class="h-8 px-3 text-xs" size="sm">End</Button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
