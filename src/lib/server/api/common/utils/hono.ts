import { type Context, Hono } from 'hono';
import { stream } from 'hono/streaming';
import type { SessionDto } from '@api/iam/sessions/dtos/sessions.dto';
import type { ChatCompletionStream } from 'openai/lib/ChatCompletionStream.mjs';

export type HonoEnv = {
	Variables: {
		session: SessionDto | null;
		browserSessionId: string;
		requestId: string;
	};
};

export function createHono() {
	return new Hono<HonoEnv>();
}

export function streamOpenAiResponse<T>(c: Context, openAiStream: ChatCompletionStream<T>) {
	return stream(c, async (stream) => {
		for await (const message of openAiStream) {
			console.dir(message, { depth: null });
			await stream.write(message.choices[0]?.delta.content ?? '');
		}
	});
}
