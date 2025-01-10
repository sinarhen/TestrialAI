<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { createQuestion } from '@/actions/index.js';
	import { Button } from '@/components/ui/button/index.js';
	import { Sparkles, Trash2 } from 'lucide-svelte';
	import type { Question } from '@/types/entities';
	import type { QuestionState } from '../../../types';

	const {
		surveyId,
		question,
		updateQuestionInStore,
		deleteQuestionInStore
	}: {
		surveyId: string;
		question: QuestionState;
		updateQuestionInStore: (updatedQuestion: Question, isJustGenerated?: boolean) => void;
		deleteQuestionInStore: () => void;
	} = $props();

	const onQuestionApprove = async () => {
		if (question.status !== 'generated') {
			throw new Error('Invalid question status');
		}
		toast.promise(createQuestion(surveyId, question), {
			loading: 'Saving question...',
			success: ({ data }) => {
				updateQuestionInStore(data, true);
				return 'Question saved successfully';
			},
			error: (error) => {
				console.error('Failed to save generated question:', error);
				deleteQuestionInStore();
				return 'Failed to save generated question';
			}
		});
	};

	const onQuestionReject = async () => {
		if (question.status !== 'generated') {
			throw new Error('Invalid question status');
		}
		deleteQuestionInStore();
		toast.success('Question is rejected. Try generating a new one 😊');
	};
</script>

<div class="mt-5 flex gap-x-2 duration-200 motion-opacity-in-0">
	<Button onclick={onQuestionApprove} variant="default" size="sm" class="gap-x-1 text-xs">
		<Sparkles size="12" />
		Approve
	</Button>
	<Button onclick={onQuestionReject} variant="outline" class="gap-x-1 text-xs" size="sm">
		<Trash2 size="12" />
		Reject
	</Button>
</div>
