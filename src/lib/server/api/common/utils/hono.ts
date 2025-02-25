import { type Context, Hono } from 'hono';
import { stream } from 'hono/streaming';
import type { SessionDto } from '@/server/api/auth/sessions/user/dtos/sessions.dto';
import type { ChatCompletionChunk } from 'openai/resources/index.mjs';
import type { Stream } from 'openai/streaming.mjs';
import type { ParticipantSessionDto } from '../../auth/sessions/participant/dtos/participant-session.dto';

export type HonoEnv = {
	Variables: {
		session: SessionDto | null;
		'participant-session': ParticipantSessionDto | null;
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
