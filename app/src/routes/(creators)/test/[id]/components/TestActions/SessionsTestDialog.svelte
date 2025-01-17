<script lang="ts">
	import { Button } from '@/components/ui/button';
	import type { TestSession } from '@/types/entities';
	import {
		ArrowUpRight,
		Circle,
		ExternalLink,
		FileClock,
		Settings,
		Trash,
		User
	} from 'lucide-svelte';
	import * as Dialog from '@/components/ui/dialog';
	import * as Accordion from '@/components/ui/accordion';
	import Separator from '@/components/ui/separator/separator.svelte';

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
					<Button variant="outline" class="block h-full w-full rounded-md border p-4">
						<div class="flex justify-between">
							<div class="flex w-full justify-between">
								<div>
									<span class="flex text-xs opacity-75">
										{session.startTime.getDate()}/{session.startTime.getMonth() +
											1}/{session.startTime.getFullYear()}
									</span>
									<h2 class="flex w-full gap-x-1 text-start text-sm font-medium">
										{session.testStateJson.title}
									</h2>
								</div>
								<div class="flex h-full gap-x-3">
									<span class="flex items-center gap-x-1 text-xs">
										<User size="12" />
										{session.participants.length}
									</span>
									<span class="flex items-center gap-x-1 text-xs">
										{!session.endTime ? 'Active' : 'Finished'}
										<Circle fill={!session.endTime ? 'green' : 'red'} size="12" />
									</span>
								</div>
							</div>
						</div>
					</Button>
				{/each}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
