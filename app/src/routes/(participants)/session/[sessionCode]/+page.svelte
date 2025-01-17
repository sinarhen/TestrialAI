<script lang="ts">
	import { Button } from '@/components/ui/button';
	import type { PageServerData } from './$types';
	import { Circle, FileQuestion, Sparkles, Timer, User } from 'lucide-svelte';
	import { goto } from '$app/navigation';

	const {
		data
	}: {
		data: PageServerData;
	} = $props();
	const { session } = data;

	const isTestFinished = session.endTime && session.endTime < new Date();
	const isTestNotStarted = !session.startTime || session.startTime > new Date();
</script>

<main class="py-32">
	<div class="flex items-end gap-x-2">
		<span class="size-8 overflow-hidden rounded-full border bg-black bg-cover">
			<img alt="fakelogo" class="h-full w-full object-cover" src="/fakeAuthor.png" />
		</span>
		<p>
			Created by
			<span class="font-bold">{session.test.user.username}</span>
		</p>
	</div>
	<div class="mt-5 flex items-center justify-between gap-x-2">
		<h1 class="text-2xl font-semibold">{session.testStateJson.title}</h1>

		<p class="flex items-center gap-x-1 text-sm font-medium">
			<Circle fill={'green'} color="green" size="16" />
			<span>{isTestFinished ? 'Ended' : 'Active'}</span>
		</p>
	</div>
	<p class="mt-1 text-base">{session.testStateJson.description}</p>
	<!-- <p>{session.}</p> -->
	<div class="mb-8 mt-4 flex flex-col gap-y-5 text-sm">
		<p class="flex items-center gap-x-1 font-medium">
			<Timer size="20" />
			<span>{session.durationInMinutes} Minutes</span>
		</p>
		<p class="flex items-center gap-x-1 font-medium">
			<FileQuestion size="20" />
			<span>{session.testStateJson.questions.length} Questions</span>
		</p>
		<p class="flex items-center gap-x-1 font-medium">
			<User size="20" />
			{session.participants.length} Participants
		</p>
	</div>

	<div class="lg: flex flex-col gap-2 md:flex-row">
		<Button disabled={isTestFinished || isTestNotStarted} class="h-8 w-full px-10 md:w-fit"
			>Start</Button
		>

		<Button
			onclick={() => goto('/')}
			variant="outline"
			disabled={isTestFinished || isTestNotStarted}
			class="h-8 w-full gap-x-1 px-10 md:w-fit"
		>
			<Sparkles size="16" />
			Generate my own test
		</Button>
	</div>
</main>
