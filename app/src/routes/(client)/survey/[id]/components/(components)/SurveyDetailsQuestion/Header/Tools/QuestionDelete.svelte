<script lang="ts">
	import { Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { type QuestionState, questionState } from '../../../../../types';
	import { deleteQuestion } from '@/services/handlers';

	const {
		question,
		surveyId,
		deleteQuestionInStore
	}: {
		question: QuestionState;
		surveyId: string;
		deleteQuestionInStore: () => void;
	} = $props();

	const onQuestionDelete = async () => {
		try {
			if (questionState.isNew(question)) {
				// If the question is new, we can just remove it from the store without making any changes to the server
				// Question that has some changes applied is saved to the server immediately and becomes 'saved'
				deleteQuestionInStore();
				return;
			}
			if (!questionState.isExisting(question)) {
				throw new Error('Invalid question status');
			}

			await deleteQuestion(surveyId, question.id);
			deleteQuestionInStore();
			toast.success('Question deleted successfully');
		} catch (error) {
			console.error('Failed to delete question:', error);
			toast.error('Failed to delete question');
		}
	};
</script>

<button
	onclick={onQuestionDelete}
	class="text-destructive opacity-25 transition-opacity group-hover:opacity-25 group-hover:hover:opacity-75 lg:opacity-0"
>
	<Trash2 size="16" />
</button>
