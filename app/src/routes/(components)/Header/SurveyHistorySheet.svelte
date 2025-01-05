<script lang="ts">
	import * as Sheet from '@/components/ui/sheet';
	import { History, CircleHelp, Timer, Gauge } from 'lucide-svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
	import type { Survey } from '@/types/entities';
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import { toast } from 'svelte-sonner';
	import type { LayoutData } from '../../$types';
	import { goto } from '$app/navigation';

	const { data }: { data: LayoutData } = $props();

	let isSheetOpen = $state(false);

	const onClick = (surveyId: string) => {
		goto(`/survey/${surveyId}`);
		isSheetOpen = false;
	};
</script>

<Sheet.Root open={isSheetOpen} onOpenChange={(val) => (isSheetOpen = val)}>
	<Sheet.Trigger>
		<History size="16" />
	</Sheet.Trigger>
	<Sheet.Content class="overflow-y-auto" side="left">
		<Sheet.Header>
			<Sheet.Title class="text-xl">Surveys history</Sheet.Title>
			<Sheet.Description>View all your past surveys</Sheet.Description>
		</Sheet.Header>
		<div class="mt-6 flex flex-col gap-y-4">
			{#if data.history}
				{#each data.history as survey}
					<Card
						onclick={() =>
							currentSurveyStore.isGenerating
								? toast.warning('Generation in progress!')
								: onClick(survey.id)}
						class="cursor-pointer"
					>
						<CardHeader>
							<CardTitle tag="h6">{survey.title}</CardTitle>
							<CardDescription class="flex w-full gap-x-2">
								<span class="flex items-center gap-x-1">
									<CircleHelp size="12" />
									{survey.questions.length} Questions
								</span>
								<span class="flex items-center gap-x-1">
									<Timer size="12" /> 10 Minutes
								</span>
								<span class="flex items-center gap-x-1">
									<Gauge size="12" /> Hard
								</span>
							</CardDescription>
						</CardHeader>
						<CardContent class="line-clamp-3 pt-2 text-sm opacity-75">
							{survey.description}
						</CardContent>
					</Card>
				{/each}
			{/if}
		</div>
	</Sheet.Content>
</Sheet.Root>
