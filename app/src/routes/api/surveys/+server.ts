import { surveySchema, type SurveyCompletion } from '@/types/entities';
import { type RequestHandler } from '@sveltejs/kit';
import { db } from '@/server/db';
import * as table from '@/server/db/schema';

export type CreateSurveyDto = SurveyCompletion;

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || !locals.session) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const survey = await request.json();
		if (!survey) {
			return new Response('Invalid data', { status: 400 });
		}

		const parsed = await surveySchema.safeParseAsync(survey);

		if (!parsed.success) {
			console.log(parsed.error);
			return new Response('Invalid data', { status: 400 });
		}

		const surveyId = await saveSurveyToDatabase(parsed.data, locals.user.id);

		return new Response(JSON.stringify(surveyId), {
			status: 200
		});
	} catch (e) {
		console.error(e);
		return new Response('Failed to save survey', { status: 500 });
	}
};

async function saveSurveyToDatabase(parsedSurvey: SurveyCompletion, createdBy: string) {
	const id = await db.transaction(async (tx) => {
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

		if (!insertedSurvey.id) {
			throw new Error('Failed to insert survey');
		}

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

			if (!question.options) {
				return;
			}
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
			}
		}
		return insertedSurvey.id;
	});

	return id;
}
