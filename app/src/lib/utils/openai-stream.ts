// stream-openai.ts

import { ChatCompletionStream } from 'openai/lib/ChatCompletionStream';
import { parse } from 'partial-json';
import { toast } from 'svelte-sonner';

interface StreamOpenAiOptions<TPartial, TFinal> {
	endpoint: string;
	method?: string;
	body?: unknown;
	onPartial?: (chunk: TPartial) => void;
	onComplete?: (finalData: TFinal) => void;
	onError?: (err: unknown) => void;
	onFinish?: () => void;
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

		const runner = ChatCompletionStream.fromReadableStream(res.body);

		runner.on('content.delta', ({ snapshot }) => {
			if (onPartial) {
				try {
					const chunk = parse(snapshot) as TPartial;
					onPartial(chunk);
				} catch (err) {
					console.error('Partial parse error:', err);
				}
			}
		});

		runner.on('content.done', ({ content }) => {
			if (onComplete) {
				try {
					const finalData = parse(content) as TFinal;
					onComplete(finalData);
				} catch (err) {
					console.error('Final parse error:', err);
				}
			}
		});
	} catch (err) {
		if (onError) {
			onError(err);
		} else {
			console.error(err);
			toast.error('Failed to stream from OpenAI');
		}
	} finally {
		if (onFinish) {
			onFinish();
		}
	}
}
