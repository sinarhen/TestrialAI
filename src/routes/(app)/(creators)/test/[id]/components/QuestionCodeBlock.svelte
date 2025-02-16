<script lang="ts">
	import type { SupportedLanguage } from '@/shared/constants/supported-codeblock-langs';
	import { getHljsStyles, getHljsWithLanguage } from '@/client/utils/code-parser';

	let {
		codeBlock,
		codeLanguage
	}: {
		codeBlock?: string | null;
		codeLanguage?: SupportedLanguage | null;
		isGenerating: boolean;
	} = $props();

	let parsed = $state<string | null>(null);
	$effect(() => {
		if (codeBlock && codeLanguage) {
			getHljsStyles();
			getHljsWithLanguage(codeLanguage)
				.then((hljs) => {
					parsed = hljs.highlight(codeBlock, {
						language: codeLanguage
					}).value;
				})
				.catch((error) => {
					console.error(error);
				});
		}
	});
</script>

<pre
	class="hljs inline-flex w-full max-w-full overflow-x-auto whitespace-pre rounded-md p-4 text-xs">
	<code class=" overflow-x-auto whitespace-pre">{@html parsed}</code>
</pre>
