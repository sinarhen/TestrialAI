import { toast } from 'svelte-sonner';

export const copy = (text: string) => {
	window.navigator.clipboard.writeText(text);
	toast.success('Copied to clipboard');
};
