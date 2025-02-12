<script lang="ts">
	import { Button } from '@/components/ui/button';
	import { FileClock } from 'lucide-svelte';
	import * as Dialog from '@/components/ui/dialog';
	import SessionItem from './SessionItem.svelte';
	import type { TestSessionDto } from '@/server/api/testSessions/dtos/test-session.dto';

	const {
		sessions
	}: {
		sessions: TestSessionDto[] | undefined;
	} = $props();

	// const calculateAverageScore = (participants: TestSessionDto['participants']) => {
	// 	const finishedParticipants = participants.filter(
	// 		(participant) => participant.status === 'completed'
	// 	);

	// 	const totalScore = finishedParticipants.reduce((prev, curr) => prev + curr.score, 0);
	// 	return totalScore / finishedParticipants.length;
	// };
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<Button
			size="sm"
			class="gap-x-1 -motion-translate-y-in-50 motion-opacity-in-0 motion-duration-500 motion-delay-[75ms]"
			variant="outline"
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
					<SessionItem {session} />
				{/each}
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
