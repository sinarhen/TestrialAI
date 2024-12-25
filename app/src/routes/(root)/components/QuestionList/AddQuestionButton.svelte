<script lang="ts">
    import { Plus } from 'lucide-svelte';
    import { Button } from '@/components/ui/button';
	import { currentSurveyStore } from '@/stores/questions.svelte';
    export let onCreate: () => void;
</script>

<Button
        disabled={currentSurveyStore.isGenerating}
        size="sm"
        on:click={onCreate}
        variant="outline"
        class="flex rounded-r-none items-center w-full justify-center gap-x-1"
>
    <Plus size="16" />
    Add question
</Button>