<script lang="ts">
    import { Button } from '@/components/ui/button';
    import {Bell, ChevronDown, CircleHelp, Gauge, History, Sparkles, Timer} from 'lucide-svelte';
    import type {ActionData, PageServerData} from "../../../../.svelte-kit/types/src/routes/$types";
    import AuthDialog from "./AuthDialog.svelte";
    import {applyAction, enhance} from "$app/forms";
    import type {SubmitFunction} from "@sveltejs/kit";
    import {toast} from "svelte-sonner";
    import {invalidateAll} from "$app/navigation";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
    import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card/index.js";
    import {dummySurveys} from "@/utils";

    let { data, form }: { data: PageServerData, form: ActionData } = $props();
    let isLoggingOutInProgress = $state(false);

    const onLogout: SubmitFunction = () => {
        isLoggingOutInProgress = true;
        return async ({ result }) => {

            switch (result.type) {
                case 'success':
                    toast.success("Successfully logged out")
                    await applyAction(result);
                    await invalidateAll()
                    break;
                case "error":
                    toast.error(result.error)
                    break;
                case "failure":
                    if (result.data && typeof result.data === 'object') {
                        toast.error(Object.entries(result.data).map(([key, value]) => `${key}: ${value}`).join('\n'));
                    } else {
                        toast.error('An unknown error occurred');
                    }
                    break;
                default:
                    toast.warning("Something went wrong. Please try reloading the page.")
                    break;
            }
            isLoggingOutInProgress = false;
        }
    }

</script>

<header class="flex h-12 pt-4 w-full items-center justify-between">
    <div class="flex w-full text-sm items-center gap-x-2">
        <Sheet.Root>
            <Sheet.Trigger>
                <History size="16" />
            </Sheet.Trigger>
            <Sheet.Content class="overflow-y-auto" side="left">
                <Sheet.Header>
                    <Sheet.Title class="text-xl">Surveys history</Sheet.Title>
                    <Sheet.Description>
                        View all your past surveys
                    </Sheet.Description>
                </Sheet.Header>
                <div class="flex flex-col gap-y-4 mt-6">
                    {#each dummySurveys as survey}
                        <Card class="cursor-pointer" >
                            <CardHeader>
                                <CardTitle tag="h6">{survey.title}</CardTitle>
                                <CardDescription class="flex w-full gap-x-2">
                                    <span class="gap-x-1 flex items-center"><CircleHelp size="12"/> {survey.questions.length} Questions</span>
                                    <span class="gap-x-1 flex items-center"><Timer size="12"/> 10 Minutes</span>
                                    <span class="gap-x-1 flex items-center"><Gauge size="12"/> Hard</span>
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="text-sm line-clamp-3 pt-2 opacity-75">
                                This survey is about {survey.title} and it has {survey.questions.length} questions in total.

                            </CardContent>
                        </Card>
                    {/each}
                </div>
            </Sheet.Content>
        </Sheet.Root>
        <Sheet.Root>
            <Sheet.Trigger>
                <div class="relative cursor-pointer">

                    <Bell size="16" />
                    <span class="bg-red-500 text-white size-2 rounded-full -right-0.5 bottom-0 px-1 absolute"></span>
                </div>
            </Sheet.Trigger>
            <Sheet.Content class="overflow-y-auto" side="right">
                <Sheet.Header>
                    <Sheet.Title class="text-xl">Notifications</Sheet.Title>
                    <Sheet.Description>
                        View all your notifications
                    </Sheet.Description>
                </Sheet.Header>
                <div class="flex flex-col gap-y-4 mt-6">
                    {#each Array.from({ length: 5 }, (_, i) => i) as _}
                        <Card class="cursor-pointer" >
                            <CardHeader>
                                <CardTitle tag="h6">Logged In</CardTitle>
                                <CardDescription class="flex w-full gap-x-2">
                                    12/04/2024 12:00
                                </CardDescription>
                            </CardHeader>
                            <CardContent class="text-sm line-clamp-3 pt-2 opacity-75">

                            </CardContent>
                        </Card>
                    {/each}
                </div>
            </Sheet.Content>
        </Sheet.Root>
        <div class="relative cursor-pointer">
            <Sparkles size="16" />
        </div>
    </div>

    <div class="w-full flex justify-center">
        <Button variant="outline">
            Basic plan
            <ChevronDown size="16" class="ml-1" />
        </Button>
    </div>

    <div class="w-full flex justify-end">
        {#if data.user}
            <form use:enhance={onLogout} method="POST" action="?/logout">
                <Button disabled={isLoggingOutInProgress} type="submit" variant="outline" size="sm">Logout</Button>
            </form>
        {:else}
        <AuthDialog {form} />
        {/if}
    </div>
</header>