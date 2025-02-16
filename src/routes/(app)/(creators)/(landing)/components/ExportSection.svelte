<script lang="ts">
	import { Button } from '@client/components/ui/button';
</script>

<section class="sticky top-1/4 mt-14 flex h-1/2 w-full flex-col xl:mt-0 xl:w-3/4">
	<h5 class="text-center text-lg font-semibold">Export</h5>
	<div class="mt-4 grid max-h-[20rem] w-full grid-cols-2 items-center gap-2 xl:mt-6 xl:h-full">
		<Button
			variant="ghost"
			class="col-span-2 flex h-16 items-center justify-center rounded-sm border enabled:hover:bg-blue-500 xl:col-span-1 xl:h-full"
		>
			<h4 class="font-bold">Google Forms</h4>
		</Button>
		<Button
			variant="ghost"
			class="col-span-2 flex h-16 items-center justify-center rounded-sm border xl:col-span-1 xl:h-full"
		>
			<h4 class="font-bold">Microsoft Forms</h4>
		</Button>
		<Button
			variant="ghost"
			class="col-span-2 flex h-16 items-center justify-center rounded-sm border enabled:hover:bg-red-400 xl:col-span-2 xl:h-full"
		>
			<h4 class="font-bold">PDF</h4>
		</Button>
	</div>
</section>
