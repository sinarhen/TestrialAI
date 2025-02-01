import { parse } from 'partial-json';
import type { DeepPartial } from '@/server/api/common/utils/deep-partial';

export interface OpenAiStreamingOptions<TFinal> {
	endpoint: string;
	method?: string;
	body?: unknown;
	signal?: AbortSignal;
	onPartial?: (partialData: DeepPartial<TFinal>) => void;
	onComplete?: (finalData: TFinal) => void;
	onError?: (error: unknown) => void;
}

export async function streamOpenAiResponse<TFinal>({
	endpoint,
	method = 'POST',
	body,
	signal,
	onPartial,
	onComplete,
	onError
}: OpenAiStreamingOptions<TFinal>) {
	try {
		const res = await fetch(endpoint, {
			method,
			headers: { 'Content-Type': 'application/json' },
			body: body ? JSON.stringify(body) : undefined,
			signal
		});

		if (!res.ok) {
			throw new Error(`Network error: ${res.status} ${res.statusText}`);
		}

		if (!res.body) {
			throw new Error('Response body is empty');
		}

		const reader = res.body.getReader();
		const decoder = new TextDecoder('utf-8');
		let buffer = '';

		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			buffer += decoder.decode(value, { stream: true });

			try {
				const partialData = parse(buffer) as DeepPartial<TFinal>;
				onPartial?.(partialData);
			} catch (err) {
				console.debug('Chunk incomplete, waiting for more data...');
				onError?.(err);
			}
		}

		buffer += decoder.decode();

		try {
			const finalData = parse(buffer) as TFinal;
			onComplete?.(finalData);
		} catch (err) {
			if (onError) {
				onError(err);
			} else {
				console.error('Final parse error:', err);
			}
		}
	} catch (error) {
		if (onError) {
			onError(error);
		} else {
			console.error('Streaming error:', error);
		}
	}
}
