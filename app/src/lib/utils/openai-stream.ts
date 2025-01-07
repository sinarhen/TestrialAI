import { ChatCompletionStream } from 'openai/lib/ChatCompletionStream';
import { parse } from 'partial-json';
import { toast } from 'svelte-sonner';

interface StreamOpenAiOptions<TPartial, TFinal> {
	endpoint: string;
	method?: string;
	body?: unknown;
	signal?: AbortSignal;
	onPartial?: (partialData: TPartial) => void;
	onComplete?: (finalData: TFinal) => void;
	onError?: (error: unknown) => void;
	onFinish?: () => void;
}

export async function streamOpenAiResponse<TPartial, TFinal>({
	endpoint,
	method = 'POST',
	body,
	signal,
	onPartial,
	onComplete
}: StreamOpenAiOptions<TPartial, TFinal>) {
	const res = await fetch(endpoint, {
		method,
		headers: {
			'Content-Type': 'application/json'
		},
		body: body ? JSON.stringify(body) : undefined,
		signal
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
				const partialData = parse(snapshot) as TPartial;
				onPartial(partialData);
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

	runner.on('abort', () => {
		console.log('Stream aborted');
	});
}
