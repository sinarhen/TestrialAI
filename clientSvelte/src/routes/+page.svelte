<script lang="ts">
    import '../app.css';
    import { fade } from 'svelte/transition';
    import { toast } from "svelte-sonner";
    import type { Question } from "@/types";
    import { testQuestions } from "@/utils";

    import Greeting from './components/Greeting.svelte';
    import QuestionList from './components/QuestionList.svelte';
    import ExportSection from './components/ExportSection.svelte';

    let topic = $state("");
    let isDeleting = false;
    let questions = $state(testQuestions);

    function onCreateSurvey() {
        // Logic to handle survey creation
    }

    function editQuestion(id: number) {
        // Implement edit logic (e.g., open a modal)
        // You might set a variable to the question being edited
    }

    function deleteQuestion(id: number) {
        if (isDeleting) {
            toast.warning("Please wait for the previous action to complete", {
                duration: 2000,
            });
            return;
        }
        const questionIndex = questions.findIndex((q) => q.id === id);
        const question = questions[questionIndex];

        if (question) {
            isDeleting = true;
            toast.success("Question deleted successfully!", {
                action: {
                    label: "Undo",
                    onClick: () => {
                        questions.splice(questionIndex, 0, question);
                        isDeleting = false;
                    },
                },
                onAutoClose: () => {
                    isDeleting = false;
                },
            });
            questions = questions.filter((q) => q.id !== id);
        } else {
            toast.warning("Internal error");
        }
    }
</script>

<Greeting bind:topic onCreateSurvey={onCreateSurvey} />

<h2 class="font-bold text-2xl">Napoleonic wars</h2>
<div class="w-full flex h-full relative xl:flex-row flex-col mt-6">
    <QuestionList {questions} onDeleteQuestion={deleteQuestion} onEditQuestion={editQuestion} />
    <ExportSection />
</div>
