<script lang="ts">
    import { Sparkles } from 'lucide-svelte';
    import { Button } from '@/components/ui/button';
    import * as Popover from "$lib/components/ui/popover";

    let isPopoverOpen = false;
    let topic = '';

    function togglePopover() {
        isPopoverOpen = !isPopoverOpen;
    }

    function generateQuestion() {
        // Implement question generation logic here
        console.log('Generating question about:', topic);
    }

</script>

<div class="relative">
    <Popover.Root>
        <Popover.Trigger>Open</Popover.Trigger>
        <Popover.Content>Place content for the popover here.</Popover.Content>
    </Popover.Root>
<!--    <Button-->
<!--            size="sm"-->
<!--            variant="outline"-->
<!--            class="flex relative w-full rounded-l-none items-center justify-center gap-x-1"-->
<!--            on:click={togglePopover}-->
<!--    >-->
<!--        <Sparkles size="16" />-->
<!--        Generate question-->
<!--    </Button>-->

</div>