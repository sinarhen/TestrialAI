<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button } from '@/components/ui/button';
	import type { PageServerData } from './$types';
	import {
		Circle,
		DoorOpen,
		FileQuestion,
		Info,
		Layout,
		Sparkles,
		Timer,
		User
	} from 'lucide-svelte';
	import { goto, invalidateAll } from '$app/navigation';
	import * as Tooltip from '@/components/ui/tooltip';
	import * as Dialog from '@/components/ui/dialog';
	import Input from '@/components/ui/input/input.svelte';
	import Separator from '@/components/ui/separator/separator.svelte';
	import LogoutButton from '../../../(creators)/components/Header/LogoutButton.svelte';
	import AuthDialog from '../../../(creators)/components/Header/AuthDialog.svelte';

	const { data, form } = $props();

	const startDate = data.session.startTime ? new Date(data.session.startTime) : null;
	const endDate = data.session.endTime ? new Date(data.session.endTime) : null;

	const isTestFinished = !!endDate && endDate < new Date();
	const isTestNotStarted = !!startDate && startDate > new Date();

	function getUserNameFallback() {
		if (data.user) {
			if (data.user.firstName && data.user.lastName) {
				return data.user.firstName + ' ' + data.user.lastName;
			}
			if (data.user.firstName) {
				return data.user.firstName;
			}
			if (data.user.lastName) {
				return data.user.lastName;
			}
			if (data.user.username) {
				return data.user.username;
			}
			if (data.user.email) {
				return data.user.email.split('@')[0];
			}
		}
		return null;
	}
	let userTestName = $state<string | null>(getUserNameFallback());

	const onSuggestionClick = (suggestion: string) => {
		userTestName = suggestion;
	};
</script>

<main class="py-32">
	<div
		class="flex items-end gap-x-2 -motion-translate-x-in-[10%] motion-opacity-in-0 motion-duration-500"
	>
		<span class="size-8 overflow-hidden rounded-full border bg-black bg-cover">
			<img alt="fakelogo" class="h-full w-full object-cover" src="/fakeAuthor.png" />
		</span>
		<p>
			Created by
			<!-- TODO: Put author name in dto  -->
			<span class="font-bold">Author</span>
		</p>
	</div>
	<div class=" mt-5 flex items-center justify-between gap-x-2">
		<h1
			class="text-2xl font-semibold -motion-translate-y-in-25 motion-opacity-in-0 motion-delay-200"
		>
			{data.session.testStateJson.title}
		</h1>

		<p
			class="flex items-center gap-x-1 text-sm font-medium motion-translate-x-in-25 motion-opacity-in-0 motion-delay-[250ms]"
		>
			<Circle fill={'green'} color="green" size="16" />
			<span>{isTestFinished ? 'Ended' : 'Active'}</span>
		</p>
	</div>
	<p class="mt-1 text-base motion-opacity-in-0 motion-delay-300">
		{data.session.testStateJson.description}
	</p>
	<!-- <p>{session.}</p> -->
	<div class="mb-8 mt-4 flex flex-col gap-y-5 text-sm">
		<p
			class="flex items-center gap-x-1 font-medium -motion-translate-x-in-[30px] motion-opacity-in-0 motion-delay-[450ms]"
		>
			<Timer size="20" />
			<span>{data.session.durationInMinutes} Minutes</span>
		</p>
		<p
			class="flex items-center gap-x-1 font-medium -motion-translate-x-in-[30px] motion-opacity-in-0 motion-delay-[550ms]"
		>
			<FileQuestion size="20" />
			<span>{data.session.testStateJson.questions.length} Questions</span>
		</p>
		<Tooltip.Root>
			<Tooltip.Trigger
				class="flex w-fit items-center gap-x-1 font-medium -motion-translate-x-in-[30px] motion-opacity-in-0 motion-delay-[650ms]"
			>
				<Layout size="20" />
				{data.session.displayMode.charAt(0).toUpperCase() + data.session.displayMode.slice(1)} mode
				<Info class="self-start" size="12" />
			</Tooltip.Trigger>
			<Tooltip.Content>
				<p class="text-xs">
					{data.session.displayMode === 'cards'
						? 'Questions are displayed one by one in a card format'
						: 'Questions are displayed all at once in a list format'}
				</p>
			</Tooltip.Content>
		</Tooltip.Root>
	</div>

	<div class="lg: flex flex-col gap-2 md:flex-row">
		<Dialog.Root open={true}>
			<Dialog.Trigger disabled={isTestFinished || isTestNotStarted}>
				<Button
					disabled={isTestFinished || isTestNotStarted}
					class="h-8 w-full px-10 -motion-translate-y-in-[10px] motion-opacity-in-0 motion-delay-700 md:w-fit"
				>
					{isTestFinished ? "Test's over" : isTestNotStarted ? 'Test not started' : 'Start Test'}
				</Button>
			</Dialog.Trigger>
			<Dialog.Content class="max-w-[500px]">
				<Dialog.Header>
					<Dialog.Title>{data.user ? 'Start the test' : 'Start the test as a guest'}</Dialog.Title>
					<Dialog.Description>Your name will be displayed to the test creator</Dialog.Description>
				</Dialog.Header>

				<div>
					<Input bind:value={userTestName} type="text" placeholder="Your name" />
					{#if data.user}
						<div class="mt-2 flex gap-x-1 text-xs">
							{#if data.user.firstName}
								<button onclick={() => onSuggestionClick(data.user?.firstName)} class="underline"
									>{data.user.firstName}</button
								>
							{/if}
							{#if data.user.lastName}
								<button onclick={() => onSuggestionClick(data.user?.lastName)} class="underline"
									>{data.user.lastName}</button
								>
							{/if}
							{#if data.user.firstName && data.user.lastName}
								<button
									onclick={() =>
										onSuggestionClick(data.user?.firstName ?? '' + data.user?.lastName)}
									class="underline">{data.user.firstName} {data.user.lastName}</button
								>
							{/if}
							{#if data.user.username}
								<button onclick={() => onSuggestionClick(data.user?.username)} class="underline"
									>{data.user.username}</button
								>
							{/if}
							{#if data.user.email}
								<button
									onclick={() => onSuggestionClick(data.user.email.split('@').at(0)) ?? ''}
									class="underline">{data.user.email.split('@').at(0)}</button
								>
							{/if}
						</div>
					{/if}
					<Button class="mt-3 w-full" disabled={!userTestName}>Start</Button>
				</div>
				<Separator />
				{#if !data.user}
					<div class="flex flex-col items-center">
						<p class="mb-1 text-center text-sm">Or login to start the test as a registered user</p>
						<AuthDialog />
					</div>
				{:else}
					<div class="">
						<p class=" text-center font-medium">
							You are logged in as
							<span class="underline">{data.user.username}</span>
						</p>
						<p class="mt-1 px-2 text-center text-sm">
							We will save your test results to your account. Logout to start the test as a <span
								class="underline">guest</span
							>
						</p>
						<LogoutButton>
							<Button type="submit" size="sm" variant="outline" class="mt-3 w-full gap-x-1">
								<DoorOpen size="16" />
								Logout
							</Button>
						</LogoutButton>
					</div>
				{/if}
			</Dialog.Content>
		</Dialog.Root>

		<Button
			onclick={() => goto('/')}
			variant="outline"
			disabled={isTestFinished || isTestNotStarted}
			class="h-8 w-full gap-x-1 px-10 -motion-translate-y-in-[10px] motion-opacity-in-0 motion-delay-[800ms] md:w-fit"
		>
			<Sparkles size="16" />
			Generate my own test
		</Button>
	</div>
</main>
