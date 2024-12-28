import { db } from '@/server/db';
import {
	type Question,
	type Survey, surveySchema, type SurveySchemaType,
} from '@/types';
import type { RequestHandler } from '@sveltejs/kit';
import * as table from '@/server/db/schema';
import { getMessages } from '@/server/openai/completions/generateSurvey';
import { openai } from '@/server/openai';
import {zodResponseFormat} from "openai/helpers/zod.mjs";

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session || !locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}
	const { topic, difficulty, numberOfQuestions } = await request.json();
	if (!topic || typeof topic !== 'string') {
		return new Response('Topic is required', { status: 400 });
	}

	const openAIStream = openai.beta.chat.completions
		.stream({
			model: 'gpt-4o',
			messages: getMessages({ topic, difficulty, numberOfQuestions }),
			response_format: zodResponseFormat(surveySchema, "generateSurvey")
		}).on('content.done', async (content) => {
			if (!content.parsed) return;

			await saveSurveyToDatabase(content.parsed, locals.user!.id);
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

async function saveSurveyToDatabase(parsedSurvey: SurveySchemaType, createdBy: string) {
	const finalSurvey: Survey = {
		...parsedSurvey,
		questions: [] as Question[],
		id: '',
		createdAt: new Date(),
		updatedAt: new Date()
	};
	await db.transaction(async (tx) => {
		// Insert SURVEY
		const [insertedSurvey] = await tx
			.insert(table.surveys)
			.values({
				...parsedSurvey,
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
		finalSurvey.id = insertedSurvey.id;
		finalSurvey.createdAt = insertedSurvey.createdAt;
		finalSurvey.updatedAt = insertedSurvey.updatedAt;

		// Insert QUESTIONS and OPTIONS
		for (const question of parsedSurvey.questions ?? []) {
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

			finalSurvey.questions?.push({
				...question,
				id: insertedQuestion.id,
				options: finalOptions
			});
		}
	});
	return finalSurvey;
}
