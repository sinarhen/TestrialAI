import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import type { Question } from '@/types';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
	y?: number;
	x?: number;
	start?: number;
	duration?: number;
};

export const flyAndScale = (
	node: Element,
	params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }
): TransitionConfig => {
	const style = getComputedStyle(node);
	const transform = style.transform === 'none' ? '' : style.transform;

	const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
		const [minA, maxA] = scaleA;
		const [minB, maxB] = scaleB;

		const percentage = (valueA - minA) / (maxA - minA);
		const valueB = percentage * (maxB - minB) + minB;

		return valueB;
	};

	const styleToString = (style: Record<string, number | string | undefined>): string => {
		return Object.keys(style).reduce((str, key) => {
			if (style[key] === undefined) return str;
			return str + `${key}:${style[key]};`;
		}, '');
	};

	return {
		duration: params.duration ?? 200,
		delay: 0,
		css: (t) => {
			const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
			const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
			const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

			return styleToString({
				transform: `${transform} translate3d(${x}px, ${y}px, 0) scale(${scale})`,
				opacity: t
			});
		},
		easing: cubicOut
	};
};

export const testQuestions: Question[] = [
	{
		id: 1,
		answerType: 'single',
		question: 'What is the capital of France?',
		options: [
			{ value: 'Paris', isCorrect: true },
			{ value: 'Berlin', isCorrect: false },
			{ value: 'Madrid', isCorrect: false },
			{ value: 'Rome', isCorrect: false }
		]
	},
	{
		id: 2,
		answerType: 'single',
		question: 'What is the capital of Germany?',
		options: [
			{ value: 'Paris', isCorrect: false },
			{ value: 'Berlin', isCorrect: true },
			{ value: 'Madrid', isCorrect: false },
			{ value: 'Rome', isCorrect: false }
		]
	},
	{
		id: 3,
		answerType: 'single',
		question: 'What is the capital of Spain?',
		options: [
			{ value: 'Paris', isCorrect: false },
			{ value: 'Berlin', isCorrect: false },
			{ value: 'Madrid', isCorrect: true },
			{ value: 'Rome', isCorrect: false }
		]
	},
	{
		id: 4,
		answerType: 'single',
		question: 'What is the capital of Italy?',
		options: [
			{ value: 'Paris', isCorrect: false },
			{ value: 'Berlin', isCorrect: false },
			{ value: 'Madrid', isCorrect: false },
			{ value: 'Rome', isCorrect: true }
		]
	}
];
