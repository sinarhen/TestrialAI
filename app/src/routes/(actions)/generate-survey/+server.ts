import { db } from '@/server/db';
import {
	Difficulties,
	type Difficulty,
	type Question,
	type Survey,
	type SurveySchemaType
} from '@/types';
import type { RequestHandler } from '@sveltejs/kit';
import * as table from '@/server/db/schema';
import { generateSurvey, getMessages } from '@/server/openai/completions/generateSurvey';
import { openai } from '@/server/openai';
import { surveySchema } from '@/types';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session || !locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const { topic, difficulty, numberOfQuestions } = await request.json();
	if (!topic || typeof topic !== 'string') {
		return new Response('Topic is required', { status: 400 });
	}
	const stream = new ReadableStream({
		start: async (controller) => {
			const encoder = new TextEncoder();

			// A helper to send SSE event data
			function sendSSE(eventName: string, data: any) {
				controller.enqueue(encoder.encode(`event: ${eventName}\n`));
				controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
			}

			try {
				const openAIStream = await openai.beta.chat.completions
					.stream({
						model: 'gpt-4o',
						messages: getMessages({ topic, difficulty, numberOfQuestions }),
						response_format: zodResponseFormat(surveySchema, 'generateSurvey')
					})
					.on('content.delta', ({ parsed }) => {
						if (!parsed) return;
						sendSSE('partial', parsed);
					})
					.on('content.done', (props) => {
						if (props.parsed) {
							sendSSE('done', props.parsed);
						}

						controller.close();
					});

				await openAIStream.done();
			} catch (err) {
				sendSSE('error', { message: (err as Error)?.message || 'Unknown error' });

				controller.close();
			}
		}
	});

	return new Response(stream, {
		status: 200,
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			// "no-transform" is also recommended so proxies don't buffer SSE
			Connection: 'keep-alive'
		}
	});
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

async function createSurvey(survey: Survey, createdBy: string) {
	await db.transaction(async (tx) => {
		// Insert SURVEY
		const [insertedSurvey] = await tx
			.insert(table.surveys)
			.values({
				...survey,
				userId: createdBy
			})
			.returning({
				id: table.surveys.id,
				createdAt: table.surveys.createdAt,
				updatedAt: table.surveys.updatedAt
			});

		if (!insertedSurvey) {
			throw new Error('Failed to insert survey');
		}
		survey.id = insertedSurvey.id;
		survey.createdAt = insertedSurvey.createdAt;
		survey.updatedAt = insertedSurvey.updatedAt;

		// Insert QUESTIONS and OPTIONS
		for (const question of survey.questions ?? []) {
			const [insertedQuestion] = await tx
				.insert(table.questions)
				.values({
					...question,
					surveyId: insertedSurvey.id
				})
				.returning({
					id: table.questions.id
				});

			if (!insertedQuestion) {
				throw new Error('Failed to insert question');
			}

			const finalOptions = [];
			for (const option of question.options) {
				const [insertedOption] = await tx
					.insert(table.options)
					.values({
						// id: newOptionId,
						...option,
						questionId: insertedQuestion.id
					})
					.returning({ id: table.options.id });

				if (!insertedOption) {
					throw new Error('Failed to insert option');
				}

				finalOptions.push({
					...option,
					id: insertedOption.id
				});
			}

			survey.questions?.push({
				...question,
				id: insertedQuestion.id,
				options: finalOptions
			});
		}
	});
	return survey;
}
