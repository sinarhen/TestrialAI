<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createQuestion, updateQuestion } from '@/services/handlers';
	import { Button } from '@/components/ui/button/index.js';
	import { Sparkles, Trash2 } from 'lucide-svelte';
	import type { Question } from '@/types/entities';
	import { questionState, type QuestionState } from '../../../types';

	const {
		testId,
		question,
		updateQuestionInStore,
		deleteQuestionInStore
	}: {
		testId: string;
		question: QuestionState;
		updateQuestionInStore: (updatedQuestion: QuestionState) => void;
		deleteQuestionInStore: () => void;
	} = $props();

	const onQuestionApprove = async () => {
		if (!questionState.isGenerated(question)) {
			throw new Error('Invalid question status');
		}
		const action =
			question.status === 'generated'
				? createQuestion(testId, question)
				: updateQuestion(testId, question);
		toast.promise(action, {
			loading: 'Saving question...',
			success: ({ data }) => {
				updateQuestionInStore({ ...data, status: 'saved', isJustGenerated: true });
				return 'Question saved successfully';
			},
			error: (error) => {
				console.error('Failed to save generated question:', error);
				toast.error('Failed to save generated question');
				deleteQuestionInStore();
				return 'Failed to save generated question';
			}
		});
	};

	const onQuestionReject = async () => {
		if (!questionState.isGenerated(question)) {
			throw new Error('Invalid question status');
		}
		if (question.status === 'generated') {
			deleteQuestionInStore();
			return;
		} else if (question.status === 'regenerated') {
			// return initial state
			updateQuestionInStore(question.initialState);
			toast.success('Question is rejected. Try generating a new one 😊');
		}
	};
</script>

<div class="motion-opacity-in-0 mt-5 flex gap-x-2 duration-200">
	<Button onclick={onQuestionApprove} variant="default" size="sm" class="gap-x-1 text-xs">
		<Sparkles size="12" />
		Approve
	</Button>
	<Button onclick={onQuestionReject} variant="outline" class="gap-x-1 text-xs" size="sm">
		<Trash2 size="12" />
		Reject
	</Button>
</div>
