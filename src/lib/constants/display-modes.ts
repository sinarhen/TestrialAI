export const displayModes = ['cards', 'list'] as const;
export type DisplayMode = (typeof displayModes)[number];
