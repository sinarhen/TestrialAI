<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '@/components/ui/button';
	import { Separator } from '@/components/ui/separator';
	import type { TestSession } from '@/server/api/db/libsql/drizzle-schema';
	import type { TestSessionDto } from '@/server/api/testSessions/dtos/test-session.dto';
	import { copy } from '@/utils/copy';
	import { Circle, Copy, ExternalLink, User } from 'lucide-svelte';

	const {
		session
	}: {
		session: TestSessionDto;
	} = $props();
	console.dir(session);
</script>

<div class="block h-full w-full rounded-md border p-4">
	<div class="flex w-full items-end justify-between">
		<div>
			<h2 class="mt-1 flex w-full gap-x-1 text-start text-sm font-medium">
				{session.testStateJson.title}
			</h2>
		</div>
		<div class="flex items-center gap-x-1 text-lg uppercase">
			{session.code}
			<Button onclick={() => copy(session.code)} variant="ghost" class="size-7" size="icon">
				<Copy size="14" />
			</Button>
		</div>
	</div>
	<Separator class="my-3" />
	<div class="flex justify-between">
		<div class="flex gap-x-3 text-sm">
			<span class="flex items-center gap-x-1 font-medium">
				<Circle
					color={!session.endTime ? 'green' : 'red'}
					fill={!session.endTime ? 'green' : 'red'}
					size="12"
				/>
				{!session.endTime ? 'Active' : 'Finished'}
			</span>
			<span class="flex items-center gap-x-1">
				<User strokeWidth={2.5} size="14" />
				{session.participantsCount}
			</span>
		</div>

		<div class="flex justify-end gap-x-1">
			<Button
				onclick={() => goto(`/session/${session.code}`)}
				class="h-8 gap-x-1 px-3 text-xs"
				variant="outline"
				size="sm">Go to <ExternalLink size="8" /></Button
			>

			<Button class="h-8 px-3 text-xs" variant="outline" size="sm">Configure</Button>

			<Button class="h-8 px-3 text-xs" size="sm">End</Button>
		</div>
	</div>
</div>
