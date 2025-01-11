import { type Difficulty } from '@/types/entities';
import type { RequestHandler } from '@sveltejs/kit';
import type { SupportedModel } from '@/types/openai';
import {generateTest} from "@/server/openai/completions/test/generate";

export type GenerateTestDto = {
	topic: string;
	difficulty: Difficulty;
	numberOfQuestions: number;
	model: SupportedModel;
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session || !locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}
	const { topic, difficulty, numberOfQuestions, model } = await request.json();
	if (!topic || typeof topic !== 'string') {
		return new Response('Topic is required', { status: 400 });
	}

	const openAIStream = generateTest(
		{ topic, difficulty, numberOfQuestions },
		{
			model
		}
	);
	return new Response(openAIStream.toReadableStream());
};

// export const GET: RequestHandler = async ({ request }) => {
// 	// Create a new readable stream

// 	return new Response(stream, {
// 		status: 200,
// 		headers: {
// 			'Content-Type': 'text/event-stream',
// 			'Cache-Control': 'no-cache',
// 			// "no-transform" is also recommended so proxies don't buffer SSE
// 			Connection: 'keep-alive'
// 		}
// 	});
// };
