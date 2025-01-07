import { db } from '@/server/db';
import {
	type Difficulty,
	type Question,
	type Survey,
	surveySchema,
	type SurveyCompletion
} from '@/types/entities';
import type { RequestHandler } from '@sveltejs/kit';
import * as table from '@/server/db/schema';
import { getMessages } from '@/server/openai/completions/generateSurvey';
import { openai } from '@/server/openai';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import type { SupportedModel } from '@/types/openai';

export type GenerateSurveyDto = {
	topic: string;
	difficulty: Difficulty;
	numberOfQuestions: number;
	model: SupportedModel;
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session || !locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}
	const { topic, difficulty, numberOfQuestions } = await request.json();
	if (!topic || typeof topic !== 'string') {
		return new Response('Topic is required', { status: 400 });
	}

	const openAIStream = openai.beta.chat.completions.stream({
		model: 'gpt-4o',
		messages: getMessages({ topic, difficulty, numberOfQuestions }),
		response_format: zodResponseFormat(surveySchema, 'generateSurvey')
	});
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
