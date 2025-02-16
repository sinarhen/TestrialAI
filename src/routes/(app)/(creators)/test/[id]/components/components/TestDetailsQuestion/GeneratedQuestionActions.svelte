<script lang="ts">
	import { toast } from 'svelte-sonner';
	import { Button } from '@client/components/ui/button/index.js';
	import { Sparkles, Trash2 } from 'lucide-svelte';
	import { questionState, type QuestionState, type SavedQuestion } from '../../../types';
	import { api } from '@/client/api';
	import { parseClientResponse } from '@/client/utils/api';

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

		try {
			if (question.status === 'generated') {
				const { data, error } = await api()
					.questions[':testId'].questions.$post({
						param: { testId },
						json: question
					})
					.then(parseClientResponse);

				if (error) {
					toast.error(error);
					return;
				}
				if (!data) {
					toast.error('Failed to approve question');
					return;
				}
				updateQuestionInStore({ ...data, status: 'saved' });
			} else if (question.status === 'regenerated') {
				const { data, error } = await api()
					.questions[':testId'].questions[':questionId'].$put({
						param: { testId, questionId: question.id },
						json: question
					})
					.then(parseClientResponse);
				if (error) {
					toast.error(error);
					return;
				}
				if (!data) {
					toast.error('Failed to approve question');
					return;
				}
				updateQuestionInStore({ ...data, status: 'saved' });
			}
		} catch (err) {
			console.error('Failed to approve question:', err);
		}
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
