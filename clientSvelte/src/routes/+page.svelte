<!-- Main.svelte -->
<script lang="ts">
    import '../app.css';
    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";
    import { Label } from "@/components/ui/label";
    import * as RadioGroup from "$lib/components/ui/radio-group";

    let topic = "";
    const questions = [
        {
            type: "single",
            question: "What year did the first coalition collapse?",
            options: [
                { value: "1803", correct: false },
                { value: "1810", correct: false },
                { value: "1800", correct: false },
                { value: "None of the above", correct: true }
            ],
        },        {
            type: "single",
            question: "What year did the first coalition collapse?",
            options: [
                { value: "1803", correct: false },
                { value: "1810", correct: false },
                { value: "1800", correct: false },
                { value: "None of the above", correct: true }
            ],
        },        {
            type: "single",
            question: "What year did the first coalition collapse?",
            options: [
                { value: "1803", correct: false },
                { value: "1810", correct: false },
                { value: "1800", correct: false },
                { value: "None of the above", correct: true }
            ],
        },        {
            type: "single",
            question: "What year did the first coalition collapse?",
            options: [
                { value: "1803", correct: false },
                { value: "1810", correct: false },
                { value: "1800", correct: false },
                { value: "None of the above", correct: true }
            ],
        },
        // ... more questions
    ];
</script>

<div class="w-full h-[75vh] flex flex-grow flex-col justify-center items-center">
    <h1 class="text-3xl animate-fadeInSlide">
        Hello, <span class="font-semibold">stranger</span>👋
    </h1>
    <p class="opacity-0 mt-0.5 animate-fadeInSlide [animation-delay:0.3s]">
        Give us a topic you want to create a survey on
    </p>
    <Input bind:value={topic} placeholder="Napoleonic wars" class="w-[400px] mt-2" />
    <Button class="mt-2">
        Create survey
    </Button>
</div>

<div class="w-full flex flex-col gap-y-10 mt-10">
    {#each questions as question}
        <div>
            <h2 class="text-xl mb-5 font-medium">{question.question}</h2>
            <RadioGroup.Root value="option-one">
                {#each question.options as option}
                    <div class="flex items-center space-x-2">
                        <RadioGroup.Item value={option.value} id={option.value} />
                        <Label for={option.value}>{option.value}</Label>
                    </div>
                {/each}
            </RadioGroup.Root>
        </div>
    {/each}
    <Button class="mt-2">
        Submit
    </Button>
</div>