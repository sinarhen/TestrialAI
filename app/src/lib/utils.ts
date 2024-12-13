import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { cubicOut } from 'svelte/easing';
import type { TransitionConfig } from 'svelte/transition';
import type {Survey} from '@/types';

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

export const dummySurveys: Survey[] = [
	{
		id: 1,
		title: 'Geography Quiz',
		createdAt: new Date(),
		updatedAt: new Date(),
		questions: [
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
		]
	},
	{
		id: 2,
		title: 'History Quiz',
		createdAt: new Date(),
		updatedAt: new Date(),
		questions: [
			{
				id: 1,
				answerType: 'single',
				question: 'Who was the first President of the United States?',
				options: [
					{ value: 'George Washington', isCorrect: true },
					{ value: 'Thomas Jefferson', isCorrect: false },
					{ value: 'Abraham Lincoln', isCorrect: false },
					{ value: 'John Adams', isCorrect: false }
				]
			},
			{
				id: 2,
				answerType: 'single',
				question: 'In which year did World War II end?',
				options: [
					{ value: '1945', isCorrect: true },
					{ value: '1939', isCorrect: false },
					{ value: '1941', isCorrect: false },
					{ value: '1950', isCorrect: false }
				]
			},
			{
				id: 3,
				answerType: 'single',
				question: 'Who discovered America?',
				options: [
					{ value: 'Christopher Columbus', isCorrect: true },
					{ value: 'Leif Erikson', isCorrect: false },
					{ value: 'Ferdinand Magellan', isCorrect: false },
					{ value: 'Marco Polo', isCorrect: false }
				]
			},
			{
				id: 4,
				answerType: 'single',
				question: 'Which ancient civilization built the pyramids?',
				options: [
					{ value: 'Egyptians', isCorrect: true },
					{ value: 'Romans', isCorrect: false },
					{ value: 'Greeks', isCorrect: false },
					{ value: 'Mayans', isCorrect: false }
				]
			}
		]
	},
	{
		id: 3,
		title: 'Science Quiz',
		createdAt: new Date(),
		updatedAt: new Date(),
		questions: [
			{
				id: 1,
				answerType: 'single',
				question: 'What is the chemical symbol for water?',
				options: [
					{ value: 'H2O', isCorrect: true },
					{ value: 'O2', isCorrect: false },
					{ value: 'CO2', isCorrect: false },
					{ value: 'H2', isCorrect: false }
				]
			},
			{
				id: 2,
				answerType: 'single',
				question: 'What planet is known as the Red Planet?',
				options: [
					{ value: 'Mars', isCorrect: true },
					{ value: 'Venus', isCorrect: false },
					{ value: 'Jupiter', isCorrect: false },
					{ value: 'Saturn', isCorrect: false }
				]
			},
			{
				id: 3,
				answerType: 'single',
				question: 'What is the speed of light?',
				options: [
					{ value: '299,792,458 meters per second', isCorrect: true },
					{ value: '150,000,000 meters per second', isCorrect: false },
					{ value: '300,000,000 meters per second', isCorrect: false },
					{ value: '299,792 meters per second', isCorrect: false }
				]
			},
			{
				id: 4,
				answerType: 'single',
				question: 'What is the powerhouse of the cell?',
				options: [
					{ value: 'Mitochondria', isCorrect: true },
					{ value: 'Nucleus', isCorrect: false },
					{ value: 'Ribosome', isCorrect: false },
					{ value: 'Endoplasmic Reticulum', isCorrect: false }
				]
			}
		]
	},
	{
		id: 4,
		title: 'Math Quiz',
		createdAt: new Date(),
		updatedAt: new Date(),
		questions: [
			{
				id: 1,
				answerType: 'single',
				question: 'What is 2 + 2?',
				options: [
					{ value: '4', isCorrect: true },
					{ value: '3', isCorrect: false },
					{ value: '5', isCorrect: false },
					{ value: '6', isCorrect: false }
				]
			},
			{
				id: 2,
				answerType: 'single',
				question: 'What is the square root of 16?',
				options: [
					{ value: '4', isCorrect: true },
					{ value: '3', isCorrect: false },
					{ value: '5', isCorrect: false },
					{ value: '6', isCorrect: false }
				]
			},
			{
				id: 3,
				answerType: 'single',
				question: 'What is the value of Pi?',
				options: [
					{ value: '3.14159', isCorrect: true },
					{ value: '3.14', isCorrect: false },
					{ value: '3.15', isCorrect: false },
					{ value: '3.13', isCorrect: false }
				]
			},
			{
				id: 4,
				answerType: 'single',
				question: 'What is 10 / 2?',
				options: [
					{ value: '5', isCorrect: true },
					{ value: '4', isCorrect: false },
					{ value: '6', isCorrect: false },
					{ value: '7', isCorrect: false }
				]
			}
		]
	},
	{
		id: 5,
		title: 'Literature Quiz',
		createdAt: new Date(),
		updatedAt: new Date(),
		questions: [
			{
				id: 1,
				answerType: 'single',
				question: 'Who wrote "To Kill a Mockingbird"?',
				options: [
					{ value: 'Harper Lee', isCorrect: true },
					{ value: 'Mark Twain', isCorrect: false },
					{ value: 'Ernest Hemingway', isCorrect: false },
					{ value: 'F. Scott Fitzgerald', isCorrect: false }
				]
			},
			{
				id: 2,
				answerType: 'single',
				question: 'Who wrote "1984"?',
				options: [
					{ value: 'George Orwell', isCorrect: true },
					{ value: 'Aldous Huxley', isCorrect: false },
					{ value: 'Ray Bradbury', isCorrect: false },
					{ value: 'J.D. Salinger', isCorrect: false }
				]
			},
			{
				id: 3,
				answerType: 'single',
				question: 'Who wrote "Moby-Dick"?',
				options: [
					{ value: 'Herman Melville', isCorrect: true },
					{ value: 'Nathaniel Hawthorne', isCorrect: false },
					{ value: 'Edgar Allan Poe', isCorrect: false },
					{ value: 'Henry James', isCorrect: false }
				]
			},
			{
				id: 4,
				answerType: 'single',
				question: 'Who wrote "Pride and Prejudice"?',
				options: [
					{ value: 'Jane Austen', isCorrect: true },
					{ value: 'Charlotte Bronte', isCorrect: false },
					{ value: 'Emily Bronte', isCorrect: false },
					{ value: 'Mary Shelley', isCorrect: false }
				]
			}
		]
	}
];