import type { DeepPartial } from '@/types/utils';
import { ChatCompletionStream } from 'openai/lib/ChatCompletionStream';
import { parse } from 'partial-json';

export interface OpenAiStreamingOptions<TFinal> {
	endpoint: string;
	method?: string;
	body?: unknown;
	signal?: AbortSignal;
	onPartial?: (partialData: DeepPartial<TFinal>) => void;
	onComplete?: (finalData: TFinal) => void;
	onError?: (error: unknown) => void;
	onFinish?: () => void;
}

export async function streamOpenAiResponse<TFinal>({
	endpoint,
	method = 'POST',
	body,
	signal,
	onPartial,
	onComplete
}: OpenAiStreamingOptions<TFinal>) {
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
				const partialData = parse(snapshot) as DeepPartial<TFinal>;
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
