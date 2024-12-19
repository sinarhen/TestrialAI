<script lang="ts">
    import * as Sheet from "@/components/ui/sheet";
    import { Bell } from 'lucide-svelte';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
</script>

<Sheet.Root>
    <Sheet.Trigger>
        <div class="relative cursor-pointer">
            <Bell size="16" />
            <span class="bg-red-500 text-white size-2 rounded-full -right-0.5 bottom-0 px-1 absolute"></span>
        </div>
    </Sheet.Trigger>
    <Sheet.Content class="overflow-y-auto" side="right">
        <Sheet.Header>
            <Sheet.Title class="text-xl">Notifications</Sheet.Title>
            <Sheet.Description>View all your notifications</Sheet.Description>
        </Sheet.Header>
        <div class="flex flex-col gap-y-4 mt-6">
            {#each Array.from({ length: 5 }, (_, i) => i) as _}
                <Card class="cursor-pointer">
                    <CardHeader>
                        <CardTitle tag="h6">Logged In</CardTitle>
                        <CardDescription class="flex w-full gap-x-2">
                            12/04/2024 12:00
                        </CardDescription>
                    </CardHeader>
                    <CardContent class="text-sm line-clamp-3 pt-2 opacity-75"></CardContent>
                </Card>
            {/each}
        </div>
    </Sheet.Content>
</Sheet.Root>