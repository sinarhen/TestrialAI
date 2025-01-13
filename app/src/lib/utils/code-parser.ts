const CODE_BLOCK_REGEX = /```(\w+)?\s*\n([\s\S]*?)```/;

// interface HighlightJsModule {
//     highlight: (code: string, options: { language: string }) => { value: string };
//     registerLanguage: (langName: string, langModule: any) => void;
// }

// highlightImportMap.ts
const highlightImportMap: Record<string, () => Promise<typeof import("highlight.js/lib/languages/*")>> = {
    typescript: () => import('highlight.js/lib/languages/typescript'),
    javascript: () => import('highlight.js/lib/languages/javascript'),
    python: () => import('highlight.js/lib/languages/python'),
    bash: () => import('highlight.js/lib/languages/bash'),
    yaml: () => import('highlight.js/lib/languages/yaml'),
    json: () => import('highlight.js/lib/languages/json'),
    xml: () => import('highlight.js/lib/languages/xml'),
    css: () => import('highlight.js/lib/languages/css'),
    csharp: () => import('highlight.js/lib/languages/csharp'),
    c: () => import('highlight.js/lib/languages/c'),
    cpp: () => import('highlight.js/lib/languages/cpp'),
    plaintext: () => import('highlight.js/lib/languages/plaintext')  // Fallback
};


export async function getHljsWithLanguage(lang: string) {
    const hljs = (await import('highlight.js/lib/core')).default;
    try {
        // Choose the correct dynamic import from our map
        const importer = highlightImportMap[lang] || highlightImportMap['plaintext'];
        const langModule = (await importer()).default;
        hljs.registerLanguage(lang, langModule);
    } catch (err) {
        console.warn(`Could not load language: ${lang}`, err);
    }

    return hljs;
}

export async function getHljsStyles() {
    await import('highlight.js/styles/github-dark-dimmed.css');
}

export function parseCodeBlock(text: string): { lang: string; code: string } | null {
    const match = CODE_BLOCK_REGEX.exec(text);
    if (!match) return null;

    const lang = match[1] ?? 'plaintext';
    const rawCode = match[2] ?? '';

    // optional indentation normalization
    const code = normalizeIndentation(rawCode.trim());
    return { lang, code };
}

export function removeCodeBlock(text: string) {
    return text.replace(CODE_BLOCK_REGEX, '');
}

function normalizeIndentation(code: string) {
    const lines = code.split('\n');

    const minIndent = Math.min(
        ...lines
            .filter((l) => l.trim() !== '')
            .map((l) => (l.match(/^(\s+)/)?.[1].length ?? 0))
    );

    return lines.map((line) => line.slice(minIndent)).join('\n');
}