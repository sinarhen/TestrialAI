<script lang="ts">
	import { type SupportedLanguage } from './../types/entities';
	import { getHljsStyles, getHljsWithLanguage } from '@/utils/code-parser';

	let {
		codeBlock,
		codeLanguage
	}: {
		codeBlock?: string | null;
		codeLanguage?: SupportedLanguage | null;
	} = $props();

	let parsed = $state<string | null>(null);
	$effect(() => {
		if (codeBlock && codeLanguage) {
			getHljsStyles();
			getHljsWithLanguage(codeLanguage).then((hljs) => {
				parsed = hljs.highlight(codeBlock, {
					language: codeLanguage
				}).value;
			});
		}
	});
</script>

{#if parsed}
	<pre class="hljs mt-2 flex rounded-md p-4 text-xs">
        <code>{@html parsed}</code>
    </pre>
{/if}
