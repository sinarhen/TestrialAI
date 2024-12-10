<script lang="ts">
    import { Button } from '@/components/ui/button';
    import {Bell, ChevronDown, History, Sparkles} from 'lucide-svelte';
    import type {ActionData, PageServerData} from "../../../../.svelte-kit/types/src/routes/$types";

    let { data, form }: { data: PageServerData, form: ActionData } = $props();

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
        <Button variant="outline" size="sm" href="?/logout">Logout</Button>
        {:else}
        <AuthDialog {form} />
        {/if}
    </div>
</header>