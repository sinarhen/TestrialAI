// stream-openai.ts

import { ChatCompletionStream } from 'openai/lib/ChatCompletionStream';
import { parse } from 'partial-json';
import { toast } from 'svelte-sonner';

type FuncWithRunner<
	T extends {
		[key: string]: any;
	} = {}
> = (
	args: T & {
		runner: ChatCompletionStream<null> | null;
	}
) => void;

interface StreamOpenAiOptions<TPartial, TFinal> {
	endpoint: string;
	method?: string;
	body?: unknown;
	onPartial?: FuncWithRunner<{ partialData: TPartial }>;
	onComplete?: FuncWithRunner<{ finalData: TFinal }>;
	onError?: FuncWithRunner<{ error: unknown }>;
	onFinish?: FuncWithRunner;
}
export async function streamOpenAiResponse<TPartial, TFinal>({
	endpoint,
	method = 'POST',
	body,
	onPartial,
	onComplete,
	onError,
	onFinish
}: StreamOpenAiOptions<TPartial, TFinal>): Promise<void> {
	let runner: ChatCompletionStream<null> | null = null;

	try {
		const res = await fetch(endpoint, {
			method,
			headers: {
				'Content-Type': 'application/json'
			},
			body: body ? JSON.stringify(body) : undefined
		});

		if (!res.ok) {
			throw new Error(`Network error: ${res.status} ${res.statusText}`);
		}

		if (!res.body) {
			throw new Error('Response body is empty');
		}

		runner = ChatCompletionStream.fromReadableStream(res.body);

		runner.on('content.delta', ({ snapshot }) => {
			if (onPartial) {
				try {
					const partialData = parse(snapshot) as TPartial;
					onPartial({ partialData, runner });
				} catch (err) {
					console.error('Partial parse error:', err);
				}
			}
		});

		runner.on('content.done', ({ content }) => {
			if (onComplete) {
				try {
					const finalData = parse(content) as TFinal;
					onComplete({ finalData, runner });
				} catch (err) {
					console.error('Final parse error:', err);
				}
			}
		});
	} catch (err) {
		if (onError) {
			onError({ error: err, runner });
		} else {
			toast.error('Failed to stream from OpenAI');
		}
	} finally {
		if (onFinish) {
			onFinish({ runner });
		}
	}
}
