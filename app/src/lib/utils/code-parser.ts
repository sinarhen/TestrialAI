import hljs from 'highlight.js';
export function highlightCode(code: string, language: string) {
    const highlighted = hljs.highlight(code, {
        language
    });
    return highlighted.value;
}
const CODE_BLOCK_REGEX = /```(\w+)?\s*\n([\s\S]*?)```/;

// Add this helper to remove minimum shared indentation:
function normalizeIndentation(code: string) {
    const lines = code.split('\n');

    // Determine the smallest indentation among non-empty lines
    const minIndent = Math.min(
        ...lines
            .filter((l) => l.trim() !== '')
            .map((l) => (l.match(/^(\s+)/)?.[1].length ?? 0))
    );

    // Slice off that indentation from each line
    return lines
        .map((line) => line.slice(minIndent))
        .join('\n');
}


export function parseCodeBlock(text: string): { lang: string; code: string } | null {
    const match = CODE_BLOCK_REGEX.exec(text);
    if (!match) return null;

    const lang = match[1] ?? 'plaintext';
    // Trim and also normalize indentation
    const rawCode = match[2].trim();
    const code = normalizeIndentation(rawCode);

    return { lang, code };
}

export function removeCodeBlock(text: string) {
    return text.replace(CODE_BLOCK_REGEX, '');
}
