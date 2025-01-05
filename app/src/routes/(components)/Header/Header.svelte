<script lang="ts">
	import { Sparkles } from 'lucide-svelte';
	import type { PageServerData, ActionData } from '../../(root)/$types';
	import AuthDialog from './AuthDialog.svelte';
	import SurveyHistorySheet from './SurveyHistorySheet.svelte';
	import NotificationsSheet from './NotificationsSheet.svelte';
	import PlanButton from './PlanButton.svelte';
	import LogoutButton from './LogoutButton.svelte';
	import type { LayoutData } from '../../$types';

	const {
		data,
		form
	}: {
		data: LayoutData;
		form: ActionData;
	} = $props();
</script>

<header class="flex h-12 w-full items-center justify-between pt-4">
	<div class="flex w-full items-center gap-x-2 text-sm">
		<SurveyHistorySheet history={data.history} />
		<NotificationsSheet />
		<div class="relative cursor-pointer">
			<Sparkles size="16" />
		</div>
	</div>

	<div class="flex w-full justify-center">
		<PlanButton />
	</div>

	<div class="flex w-full justify-end">
		{#if data?.user}
			<LogoutButton />
		{:else}
			<AuthDialog {form} />
		{/if}
	</div>
</header>
