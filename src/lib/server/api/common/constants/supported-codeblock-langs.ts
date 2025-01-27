export const supportedLangs = [
	'typescript',
	'javascript',
	'python',
	'bash',
	'yaml',
	'json',
	'xml',
	'css',
	'csharp',
	'c',
	'cpp',
	'plaintext',
	'java',
	'go',
	'rust',
	'ruby',
	'php',
	'sql',
	'perl'
] as const;
export type SupportedLanguage = (typeof supportedLangs)[number];
