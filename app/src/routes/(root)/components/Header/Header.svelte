<script lang="ts">
    import { Sparkles } from 'lucide-svelte';
    import type { PageServerData, ActionData } from "../../../../../.svelte-kit/types/src/routes/(root)/$types";
    import AuthDialog from "./AuthDialog.svelte";
    import SurveyHistorySheet from "./SurveyHistorySheet.svelte";
    import NotificationsSheet from "./NotificationsSheet.svelte";
    import PlanButton from "./PlanButton.svelte";
    import LogoutButton from "./LogoutButton.svelte";

    export let data: PageServerData;
    export let form: ActionData;
</script>

<header class="flex h-12 pt-4 w-full items-center justify-between">
    <div class="flex w-full text-sm items-center gap-x-2">
        <SurveyHistorySheet {data} />
        <NotificationsSheet />
        <div class="relative cursor-pointer">
            <Sparkles size="16" />
        </div>
    </div>

    <div class="w-full flex justify-center">
        <PlanButton />
    </div>

    <div class="w-full flex justify-end">
        {#if data.user}
            <LogoutButton />
        {:else}
            <AuthDialog {form} />
        {/if}
    </div>
</header>