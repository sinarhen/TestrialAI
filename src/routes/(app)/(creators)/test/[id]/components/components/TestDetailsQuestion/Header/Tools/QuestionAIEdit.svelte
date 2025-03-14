<script lang="ts">
	import * as DropdownMenu from '@client/components/ui/dropdown-menu';
	import type { QuestionModificationTool } from '@/client/types/openai';
	import { Brain, CaseLower, Globe, RotateCw, Sparkles, ChevronDown, Icon } from 'lucide-svelte';
	import { questionState, type QuestionState } from '../../../../../types';
	import { toast } from 'svelte-sonner';
	import lodash from 'lodash';
	import { streamOpenAiResponse } from '@/client/utils/openai-stream';
	import { api } from '@/client/api';
	import type { GeneratedQuestionDto } from '@/server/api/questions/dtos/question.dto';

	let isActionMenuOpen = $state(false);

	const {
		question,
		testId,
		updateQuestionInStore
	}: {
		question: QuestionState;
		testId: string;
		updateQuestionInStore: (updatedQuestion: QuestionState) => void;
	} = $props();

	const onToolChoose = async (tool: QuestionModificationTool) => {
		if (!questionState.isSaved(question)) {
			toast.error('Question must be saved before applying tools');
			throw new Error('Invalid question status');
		}
		toast.info(`Applying '${tool}' tool to question...`);
		const questionStatePreserved = lodash.cloneDeep(question);

		const questionModifyEndpointUrl = api()
			.questions[':testId'].questions[':questionId'][':tool'].$url({
				param: {
					tool,
					testId,
					questionId: question.id
				}
			})
			.toString();
		await streamOpenAiResponse<GeneratedQuestionDto>({
			endpoint: questionModifyEndpointUrl,
			onPartial: (partialData) => {
				updateQuestionInStore({
					id: question.id,
					...partialData,
					status: 'regenerating'
				});
			},
			onComplete: (finalData) => {
				updateQuestionInStore({
					id: question.id,
					...finalData,
					status: 'regenerated',
					initialState: questionStatePreserved
				});
				console.log(finalData);

				toast.success(`Question updated with '${tool}' tool.`);
			}
		});
	};

	const tools: {
		icon: typeof Icon;
		tool: QuestionModificationTool;
		label: string;
	}[] = [
		{
			icon: RotateCw,
			label: 'Rephrase',
			tool: 'rephrase'
		},
		{
			icon: Brain,
			label: 'Harder',
			tool: 'harder'
		},
		{
			icon: CaseLower,
			label: 'Simplify',
			tool: 'simplify'
		}
		// {
		// 	icon: Globe,
		// 	label: 'Translate',
		// 	tool: 'translate'
		// }
	];
</script>

<DropdownMenu.Root
	closeOnItemClick={true}
	open={isActionMenuOpen}
	onOpenChange={() => (isActionMenuOpen = !isActionMenuOpen)}
>
	<DropdownMenu.Trigger
		class="inline-flex cursor-pointer items-center opacity-25 transition-opacity hover:opacity-75 group-hover:opacity-25 group-hover:hover:opacity-100 lg:opacity-0"
	>
		<Sparkles size="16" />
		<ChevronDown size="12" />
	</DropdownMenu.Trigger>
	<DropdownMenu.Content class="relative w-[200px]">
		<DropdownMenu.Group>
			<DropdownMenu.Label>Actions</DropdownMenu.Label>
			<DropdownMenu.Separator />
			{#each tools as { icon: Icon, label, tool } (tool)}
				<DropdownMenu.Item onclick={() => onToolChoose(tool)} class="flex items-center gap-x-2">
					<Icon size="16"></Icon>
					{label}
				</DropdownMenu.Item>
			{/each}
		</DropdownMenu.Group>
	</DropdownMenu.Content>
</DropdownMenu.Root>
