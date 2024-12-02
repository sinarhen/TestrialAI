<script lang="ts">
    import { Sparkles } from 'lucide-svelte';
    import { Button } from '@/components/ui/button';
    import * as Popover from "$lib/components/ui/popover";
    import {Input} from "@/components/ui/input";
    import {Label} from "@/components/ui/label";

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

<div class="relative w-full">
    <Popover.Root>
        <Popover.Trigger class="w-full">
            <Button
                    size="sm"
                    variant="outline"
                    class="flex relative w-full rounded-l-none items-center justify-center gap-x-1"
                    on:click={togglePopover}
            >
                <Sparkles size="16" />
                Generate question
            </Button>
        </Popover.Trigger>
        <Popover.Content side="top">
            <Label>
                Topic
            </Label>
            <p class="text-xs opacity-50">
                Enter a topic to generate a question about
            </p>
            <Input class="mt-1.5"/>
            <Button
                    variant="ghost"
                    size="sm"
                    class="mt-2 gap-x-1"
                    onclick={generateQuestion}
            >
                <Sparkles size="16"/>
                Generate
            </Button>
        </Popover.Content>
    </Popover.Root>


</div>