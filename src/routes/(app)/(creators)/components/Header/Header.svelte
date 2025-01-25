<script lang="ts">
	import { ChevronRight, DoorOpen, Home, Sparkles } from 'lucide-svelte';
	import type { ActionData } from '../../(root)/$types';
	import AuthDialog from './AuthDialog.svelte';
	import TestHistorySheet from './TestHistorySheet.svelte';
	import NotificationsSheet from './NotificationsSheet.svelte';
	import type { LayoutData } from '../../$types';
	import * as Popover from '@/components/ui/popover';
	import { Button } from '@/components/ui/button';
	import { goto } from '$app/navigation';
	import { Separator } from '@/components/ui/separator';
	import LogoutButton from './LogoutButton.svelte';
	const {
		data,
		form
	}: {
		data: LayoutData;
		form: ActionData;
	} = $props();

	let isUpgradePlanPopoverOpen = $state(false);
</script>

<header class="flex h-12 w-full items-center justify-between pt-4">
	<div class="flex w-full items-center gap-x-2 text-sm">
		<TestHistorySheet history={data.history} />
		<NotificationsSheet />
		<div class="relative flex cursor-pointer items-center">
			<Popover.Root
				onOpenChange={(val) => (isUpgradePlanPopoverOpen = val)}
				open={isUpgradePlanPopoverOpen}
			>
				<Popover.Trigger
					onmouseenter={() => {
						isUpgradePlanPopoverOpen = true;
					}}
				>
					<Sparkles size="17" class="mb-[0.2px]" strokeWidth="1.7" />
				</Popover.Trigger>
				<Popover.Content
					side="bottom"
					class="ml-36 mt-2 text-sm"
					onmouseleave={() => {
						isUpgradePlanPopoverOpen = false;
					}}
				>
					<div class="flex items-center">
						<span class="rounded-[2px] p-1 text-xs font-medium uppercase leading-none">basic</span>
						<span><ChevronRight size="16" /></span>
						<span
							class="rounded-[2px] bg-purple-400 p-1 text-xs font-medium uppercase leading-none text-white"
							>pro</span
						>
					</div>

					<p class="text-lg font-medium motion-opacity-in-0">Upgrade your plan</p>
					<Separator class="mb-5 mt-2" />
					<p class="">Here are some features you can unlock:</p>
					<ul class="ml-4 mt-2 list-disc text-xs">
						<li>Unlimited test generation</li>
						<li>Test generation based on documents</li>
						<li>Export to PDF</li>
						<li>Google forms integration</li>
						<li>Custom test design</li>
						<li>
							<a class="underline" href="/plans"> Read more</a>
						</li>
					</ul>
					<Separator class="mb-2 mt-4" />
					<p class="text-center align-bottom">
						<span class="text-lg">1.99$ </span>
						<span class="text-xs opacity-50"> / month </span>
					</p>
					<Button variant="outline" size="sm" class="mt-1 w-full">Upgrade now</Button>
				</Popover.Content>
			</Popover.Root>
		</div>
	</div>

	<div class="flex w-full justify-center">
		<Home size="20" class="cursor-pointer" onclick={() => goto('/')} />
	</div>

	<div class="flex w-full justify-end">
		{#if data?.user}
			<div class="flex items-center gap-x-2 text-sm">
				{data.user.username}
				<Separator orientation="vertical" />
				<LogoutButton>
					<button type="submit">
						<DoorOpen size="16" />
					</button>
				</LogoutButton>
			</div>
		{:else}
			<AuthDialog isInitiallyOpen={data.authRequired} {form} />
		{/if}
	</div>
</header>
