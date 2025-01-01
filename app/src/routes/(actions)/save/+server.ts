import { type Question, type Survey, surveySchema, type SurveySchemaType } from '@/types/entities';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '@/server/db';
import * as table from '@/server/db/schema';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const survey = await request.json();
	if (!survey) {
		return new Response('Invalid data', { status: 400 });
	}

	const parsed = await surveySchema.safeParseAsync(survey);
	if (!parsed.success) {
		console.log(parsed.error);
		return new Response('Invalid data', { status: 400 });
	}

	const finalSurvey = await saveSurveyToDatabase(parsed.data, locals.user.id);

	return new Response(JSON.stringify(finalSurvey), { status: 200 });
};

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
