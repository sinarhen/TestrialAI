import { getContext, hasContext, setContext } from 'svelte';

const rune = <T>(initialValue: T) => {
	return $state({ value: initialValue });
};

const useSharedStore = <T, A>(name: string, fn: (value?: A) => T, defaultValue?: A) => {
	if (hasContext(name)) {
		return getContext<T>(name);
	}
	const _value = fn(defaultValue);
	setContext(name, _value);
	return _value;
};

// shared rune
export const useRune = <T>(name: string, value: T) => useSharedStore(name, rune, value);
