<script lang="ts">
    import { Plus } from 'lucide-svelte';
    import { Button } from '@/components/ui/button';
    export let onCreate: () => void;
</script>

<Button
        size="sm"
        on:click={onCreate}
        variant="outline"
        class="flex rounded-r-none items-center w-full justify-center gap-x-1"
>
    <Plus size="16" />
    Add question
</Button>