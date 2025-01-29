import { type Context, Hono } from 'hono';
import { stream } from 'hono/streaming';
import type { SessionDto } from '@api/iam/sessions/dtos/sessions.dto';
import type { Stream } from 'openai/streaming';
import type { ChatCompletionChunk } from 'openai/resources/index.mjs';

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

export function streamOpenAiResponse(c: Context, openAiStream: Stream<ChatCompletionChunk>) {
	return stream(c, async (stream) => {
		for await (const message of openAiStream) {
			await stream.write(message.choices[0]?.delta.content ?? '');
		}
	});
}
