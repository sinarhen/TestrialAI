import { useRune } from '@/rune.svelte';
import type { DisplayMode } from '@/types/entities';

interface ContextType {
	displayMode: DisplayMode | null;
	durationInMinutes: number | null;
	otherSettings: any | null;
}

export const useTestSettings = () =>
	useRune<ContextType>('testSettings', {
		displayMode: null,
		durationInMinutes: null,
		otherSettings: null
	});
