<script lang="ts">
    import * as Sheet from "@/components/ui/sheet";
    import { History, CircleHelp, Timer, Gauge } from 'lucide-svelte';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
    import type { PageServerData } from "../../../../../.svelte-kit/types/src/routes/(root)/$types";

    let {data }:{ data: PageServerData} = $props()
</script>

<Sheet.Root>
    <Sheet.Trigger>
        <History size="16" />
    </Sheet.Trigger>
    <Sheet.Content class="overflow-y-auto" side="left">
        <Sheet.Header>
            <Sheet.Title class="text-xl">Surveys history</Sheet.Title>
            <Sheet.Description>View all your past surveys</Sheet.Description>
        </Sheet.Header>
        <div class="flex flex-col gap-y-4 mt-6">
            {#if data.history}
                {#each data.history as survey}
                    <Card class="cursor-pointer">
                        <CardHeader>
                            <CardTitle tag="h6">{survey.title}</CardTitle>
                            <CardDescription class="flex w-full gap-x-2">
                                <span class="gap-x-1 flex items-center">
                                    <CircleHelp size="12" /> {survey.questions.length} Questions
                                </span>
                                <span class="gap-x-1 flex items-center">
                                    <Timer size="12" /> 10 Minutes
                                </span>
                                <span class="gap-x-1 flex items-center">
                                    <Gauge size="12" /> Hard
                                </span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent class="text-sm line-clamp-3 pt-2 opacity-75">
                            {survey.description}
                        </CardContent>
                    </Card>
                {/each}
            {/if}
        </div>
    </Sheet.Content>
</Sheet.Root>