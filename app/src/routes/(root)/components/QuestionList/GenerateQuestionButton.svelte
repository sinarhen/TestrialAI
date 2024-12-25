<script lang="ts">
    import { Sparkles } from 'lucide-svelte';
    import { Button } from '@/components/ui/button';
    import * as Popover from "@/components/ui/popover";
    import {Input} from "@/components/ui/input";
    import {Label} from "@/components/ui/label";
	import { currentSurveyStore } from '@/stores/questions.svelte';
	import { toast } from 'svelte-sonner';
	import axios from 'axios';
	import type { GenerateQuestionDto } from '../../../(actions)/generate-question/+server';

    let isPopoverOpen = $state(false);
    let questionTopic = $state("");

    function togglePopover() {
        isPopoverOpen = !isPopoverOpen;
    }


    const onGenerate = async () => {
            try {
                currentSurveyStore.isGenerating = true;

                const body =  {
                    topic: questionTopic,
                    survey: currentSurveyStore.survey
                } as GenerateQuestionDto
                const res = await axios.post("/generate-question", body);
        
                if (res.status !== 200) {
                   toast.error(res.statusText);
                   return;
                }
                if (!res.data) {
                    toast.error("No question generated");
                    return;
                }

                currentSurveyStore.survey?.questions.push(res.data);
                isPopoverOpen = false
                
                toast.success("Successfully generated a question");
            }  
            catch (err) {
                if (axios.isAxiosError(err)) {
                    toast.error(err.message);
                    console.log(err.status);
                } else {
                    console.log(err);
                    toast.error("Failed to generate a question");
                }
            }
            finally {
                currentSurveyStore.isGenerating = false;
            }
        }
</script>

<div class="relative w-full">
    <Popover.Root>
        <Popover.Trigger class="w-full">
            <Button
                    disabled={currentSurveyStore.isGenerating}
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
            <Input disabled={currentSurveyStore.isGenerating} bind:value={questionTopic} class="mt-1.5"/>
            <Button
                    onclick={onGenerate}
                    disabled={currentSurveyStore.isGenerating}
                    variant="ghost"
                    size="sm"
                    class="mt-2 gap-x-1"
            >
                <Sparkles size="16"/>
                Generate
            </Button>
        </Popover.Content>
    </Popover.Root>


</div>