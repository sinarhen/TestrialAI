export function slugify(text: string): string {
	return text
		.toLowerCase()
		.trim()
		.normalize('NFD') // Normalize to decompose accented characters
		.replace(/[\u0300-\u036f]/g, '') // Remove diacritics
		.replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
		.replace(/[^\w-]+/g, ''); // Remove all non-word characters except hyphens
}
