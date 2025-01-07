<script lang="ts">
	import { ChevronRight, Home, Sparkles } from 'lucide-svelte';
	import type { PageServerData, ActionData } from '../../(root)/$types';
	import AuthDialog from './AuthDialog.svelte';
	import SurveyHistorySheet from './SurveyHistorySheet.svelte';
	import NotificationsSheet from './NotificationsSheet.svelte';
	import PlanButton from './PlanButton.svelte';
	import LogoutButton from './LogoutButton.svelte';
	import type { LayoutData } from '../../$types';
	import * as Popover from '@/components/ui/popover';
	import { Button } from '@/components/ui/button';
	import { goto } from '$app/navigation';
	import { Separator } from '@/components/ui/separator';
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
		<SurveyHistorySheet history={data.history} />
		<NotificationsSheet />
		<div class="relative cursor-pointer">
			<Popover.Root
				onOpenChange={(val) => (isUpgradePlanPopoverOpen = val)}
				open={isUpgradePlanPopoverOpen}
			>
				<Popover.Trigger
					onmouseenter={() => {
						isUpgradePlanPopoverOpen = true;
					}}
				>
					<Sparkles size="16" />
				</Popover.Trigger>
				<Popover.Content
					side="bottom"
					class="ml-36 mt-2 text-sm"
					onmouseleave={() => {
						isUpgradePlanPopoverOpen = false;
					}}
				>
					<div class="flex items-center">
						<span
							class="bg-accent-fegr rounded-[2px] p-0.5 text-xs font-medium uppercase leading-none"
							>basic</span
						>
						<span><ChevronRight size="16" /></span>
						<span
							class="rounded-[2px] bg-purple-400 p-0.5 text-xs font-medium uppercase leading-none"
							>pro</span
						>
					</div>

					<p class="text-lg font-medium">Upgrade your plan</p>
					<Separator class="mb-4 mt-2" />
					<p class="">Here are some features you can unlock:</p>
					<ul class="ml-4 mt-2 list-disc text-xs">
						<li>Unlimited survey generation</li>
						<li>Survey generation based on documents</li>
						<li>Export to PDF</li>
						<li>Google forms integration</li>
						<li>Custom survey design</li>
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
			<LogoutButton />
		{:else}
			<AuthDialog {form} />
		{/if}
	</div>
</header>
