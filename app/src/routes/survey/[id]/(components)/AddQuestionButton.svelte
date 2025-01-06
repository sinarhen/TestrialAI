<script lang="ts">
	import { Plus } from 'lucide-svelte';
	import { Button } from '@/components/ui/button';
	import { v4 as uuidv4 } from 'uuid';
	import { currentSurvey } from '@/stores/survey-details.svelte';

	function onCreateQuestion() {
		if (!currentSurvey.survey) return;
		const qs = currentSurvey.survey.questions;
		currentSurvey.survey.questions = [
			...(qs ?? []),
			{
				id: uuidv4(),
				question: 'New question',
				correctAnswer: null,
				answerType: 'single',
				options: [
					{ id: uuidv4(), value: 'Option 1', isCorrect: true },
					{ id: uuidv4(), value: 'Option 2', isCorrect: false },
					{ id: uuidv4(), value: 'Option 3', isCorrect: false },
					{ id: uuidv4(), value: 'Option 4', isCorrect: false }
				]
			}
		];

		currentSurvey.isDirty = true;
	}

</script>

<Button
	disabled={currentSurvey.isGenerating}
	size="sm"
	onclick={onCreateQuestion}
	variant="outline"
	class="flex w-full items-center justify-center gap-x-1 rounded-r-none"
>
	<Plus size="16" />
	Add question
</Button>
