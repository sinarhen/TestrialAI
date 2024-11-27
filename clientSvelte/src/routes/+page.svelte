<script lang="ts">
    import '../app.css';
    import { Input } from "@/components/ui/input";
    import { Button } from "@/components/ui/button";
    import { Label } from "@/components/ui/label";
    import * as RadioGroup from "$lib/components/ui/radio-group";
    import {Check, Save, Share2} from "lucide-svelte";
    import * as Card from "$lib/components/ui/card/index.js";

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
            type: "multiple",
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

<h2 class="font-bold text-2xl">Napoleonic wars</h2>
<div class="w-full flex h-full relative xl:flex-row flex-col mt-6">
    <section class="flex w-full flex-col gap-y-10">
        {#each questions as question}
            {#if question.type === "single"}
                <div>
                    <h3 class="text-xl mb-5 font-medium">{question.question}</h3>
                    <RadioGroup.Root value="option-one">
                        {#each question.options as option}
                            <div class="flex items-center space-x-2">
                                <RadioGroup.Item value={option.value} id={option.value} />
                                <Label for={option.value}>{option.value}
                                    {#if option.correct}
                                        <span class="text-green">✅</span>
                                    {/if}
                                </Label>
                            </div>
                        {/each}
                    </RadioGroup.Root>
                </div>

            {:else if question.type === "multiple"}
                <div>
                    Multiple choice question
                </div>
            {/if}
        {/each}
        <div class="flex w-full xl:justify-start justify-center">

            <div class="grid w-full gap-y-2 xl:max-w-[400px] gap-x-2 grid-cols-4">
                <Button class="col-span-4 gap-x-1">
                    <Save size="16"/>
                    Save
                </Button>
                <Button variant="outline" class="gap-x-1 inline-flex xl:hidden col-span-4">
                    <Share2 size="16" />
                    Share
                </Button>

            </div>
        </div>
    </section>
    <section class="flex flex-col w-full mt-14 xl:mt-0">
        <h5 class="text-lg font-semibold text-center">Export</h5>

        <div class="grid grid-cols-2 gap-2 w-full mt-4 xl:h-full xl:mt-0 items-center">
            <Button variant="ghost" class="h-16 xl:h-full border enabled:hover:bg-blue-500 col-span-2 xl:col-span-1  rounded-sm flex items-center justify-center">
                <h4 class="font-bold">Google Forms</h4>
            </Button>
            <Button variant="ghost" class=" h-16 xl:h-full border col-span-2 xl:col-span-1  rounded-sm flex items-center justify-center">
                <h4 class="font-bold">Microsoft Forms</h4>
            </Button>
            <Button variant="ghost" class="h-16 xl:h-full border enabled:hover:bg-red-400 col-span-2 xl:col-span-2 rounded-sm flex items-center justify-center">
                <h4 class="font-bold">PDF</h4>
            </Button>

        </div>
    </section>
</div>