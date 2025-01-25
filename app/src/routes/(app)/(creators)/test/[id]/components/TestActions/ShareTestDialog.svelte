<script lang="ts">
	import { browser } from '$app/environment';
	import { Button } from '@/components/ui/button';
	import * as Dialog from '@/components/ui/dialog';
	import { Separator } from '@/components/ui/separator';
	import { Link, Share } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';

	const {
		testId
	}: {
		testId: string;
	} = $props();

	const shareLink = browser
		? `${window.location.origin}/test/${testId}/share`
		: 'Unable to copy link';

	const onPdfExport = () => {
		window.location.href = `/api/tests/${testId}/pdf`;

		toast.success('Downloaded started');
	};

	const onCopyLink = () => {
		navigator.clipboard.writeText(shareLink);
		toast.success('Link copied to clipboard');
	};
</script>

<Dialog.Root>
	<Dialog.Trigger>
		<Button
			variant="outline"
			size="sm"
			class="-motion-translate-y-in-50 motion-opacity-in-0 motion-duration-500 motion-delay-[75ms] gap-x-1"
		>
			Share <Share size="12" />
		</Button>
	</Dialog.Trigger>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Share test</Dialog.Title>
		</Dialog.Header>
		<Dialog.Description>Share this test with your friends</Dialog.Description>
		<div>
			<Button
				onclick={onCopyLink}
				variant="outline"
				class=" flex h-auto w-full cursor-pointer gap-x-1 text-sm outline-2 hover:outline"
			>
				Link <Link size="12" /> <br />
			</Button>
			<p class="mt-1 text-center text-xs opacity-50">Click to copy</p>
		</div>
		<Separator class="mb-4 mt-3" />
		<!-- <Dialog.Footer>
                <Button>Copy link</Button>
            </Dialog.Footer> -->
		<div>
			<p class="text-center text-xs opacity-50">Or export as:</p>
			<!-- <Button
                    class="mt-2 flex h-12 w-full items-center justify-center rounded-md border text-xs"
                >
                    Google forms
                </Button> -->
			<Button
				onclick={onPdfExport}
				variant="outline"
				class="mt-2 flex h-12 w-full items-center justify-center rounded-md border text-xs"
			>
				PDF
			</Button>
			<Button
				variant="outline"
				class="mt-2 flex h-12 w-full items-center justify-center rounded-md border text-xs"
			>
				Google forms
			</Button>
		</div>
	</Dialog.Content>
</Dialog.Root>
