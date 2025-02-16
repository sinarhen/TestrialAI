<script lang="ts">
	import { goto, invalidate } from '$app/navigation';
	import { api } from '@/client/api';
	import * as AlertDialog from '@client/components/ui/alert-dialog';
	import { Button } from '@client/components/ui/button';
	import { Trash2 } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	const {
		testId
	}: {
		testId: string;
	} = $props();
</script>

<AlertDialog.Root>
	<AlertDialog.Trigger asChild let:builder>
		<Button
			class="gap-x-1 -motion-translate-y-in-50 motion-opacity-in-0 motion-duration-500 motion-delay-[225ms]"
			size="sm"
			onclick={() => {}}
			builders={[builder]}
			variant="outline"
		>
			Delete <Trash2 size="12" />
		</Button>
	</AlertDialog.Trigger>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
			<AlertDialog.Description>
				This action cannot be undone. This will permanently delete this test and remove data from
				our servers.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={() => {
					if (testId) {
						api()
							.tests[':testId'].$delete({
								param: {
									testId
								}
							})
							.then((res) => {
								if (res.status < 300 && res.status >= 200) {
									toast.success('Test is deleted successfully');

									goto('/');
									invalidate('/');
								}
							})
							.catch((err) => {
								console.error(err);
								toast.error('Something went wrong. Please try again later');
							});
					} else {
						console.error('Test has no ID');
						toast.error('Internal error. Please try again later.');
					}
				}}>Continue</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
