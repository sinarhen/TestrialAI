<script lang="ts">
    import { Sparkles } from 'lucide-svelte';
    import { Button } from '@/components/ui/button';
    import * as Popover from "@/components/ui/popover";
    import {Input} from "@/components/ui/input";
    import {Label} from "@/components/ui/label";
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { applyAction, enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import type { Question, Survey } from '@/types';

    let isPopoverOpen = $state(false);
    let isGenerating = $state(false);

    function togglePopover() {
        isPopoverOpen = !isPopoverOpen;
    }

   

    const onGenerate: SubmitFunction = () => {
        toast.success("Generation started")
        isGenerating = true;
        return async ({ result }) => {
            switch (result.type) {
                case 'success':
                    toast.success("Successfully generated a question")
                    console.log(result.data)
                    currentSurveyStore.survey?.questions.push(result.data as Question);
                    break;
                // case 'failure':
                //     console.error(result)
                // case "error":
                //     consol
                //     break;
                default: console.error(result);
            }

            await applyAction(result);
            await invalidateAll()
            isGenerating = false;
        }
    }
</script>

<div class="relative w-full">
    <Popover.Root>
        <Popover.Trigger class="w-full">
            <Button
                    disabled={isGenerating}
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
                About...
            </Label>
            <p class="text-xs opacity-50">
                Enter a topic to generate a question about
            </p>
            <form method="POST" action="?/generateQuestion" use:enhance={onGenerate}>
                <Input disabled={isGenerating} name="topic" class="mt-1.5"/>
                <Input type="hidden" name="survey" value={JSON.stringify(currentSurveyStore.survey)} />
                <Button
                        disabled={isGenerating}
                        type="submit"
                        variant="ghost"
                        size="sm"
                        class="mt-2 gap-x-1"
                >
                    <Sparkles size="16"/>
                    Generate
                </Button>
            </form>
        </Popover.Content>
    </Popover.Root>


</div>