<script lang="ts">
	import {
		getHljsStyles,
		getHljsWithLanguage,
		parseCodeBlock,
		removeCodeBlock
	} from '@/utils/code-parser';

	const {
		questionTitle
	}: {
		questionTitle?: string;
	} = $props();

	let codeBlock = $state<string | null>(null);
	let questionTextWithoutCode = $state<string | null>(questionTitle || '');

	let highlightLoaded = false;

	$effect(() => {
		if (!questionTitle) {
			codeBlock = null;
			questionTextWithoutCode = questionTitle ?? null;
		} else {
			const parsedCode = parseCodeBlock(questionTitle);
			if (parsedCode) {
				console.log(parsedCode);

				console.log(parsedCode);

				questionTextWithoutCode = removeCodeBlock(questionTitle);

				console.log(questionTitle);

				if (!highlightLoaded) {
					highlightLoaded = true;
					getHljsStyles();
				}
				// Now dynamically import highlight.js core + language
				getHljsWithLanguage(parsedCode.lang).then((hljs) => {
					const { value } = hljs.highlight(parsedCode.code, {
						language: parsedCode.lang
					});
					console.log(codeBlock);
					codeBlock = value;
				});
			} else {
				codeBlock = null;
			}
		}
	});
</script>

<h3 class="text-xl font-medium">
	{questionTextWithoutCode}

	{#if codeBlock}
		<pre class="hljs mt-2 flex rounded-md p-4 text-xs">
		<code>{@html codeBlock}</code>
	</pre>
	{/if}
</h3>
