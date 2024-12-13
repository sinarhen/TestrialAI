<script lang="ts">
    import { Button } from '@/components/ui/button';
    import {Bell, ChevronDown, History, Sparkles} from 'lucide-svelte';
    import type {ActionData, PageServerData} from "../../../../.svelte-kit/types/src/routes/$types";
    import AuthDialog from "./AuthDialog.svelte";
    import {applyAction, enhance} from "$app/forms";
    import type {SubmitFunction} from "@sveltejs/kit";
    import {toast} from "svelte-sonner";
    import {invalidateAll} from "$app/navigation";
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
        <History size="16" class="cursor-pointer" />
        <div class="relative cursor-pointer">
            <Bell size="16" />
            <span class="bg-red-500 text-white size-2 rounded-full -right-0.5 bottom-0 px-1 absolute"></span>
        </div>
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