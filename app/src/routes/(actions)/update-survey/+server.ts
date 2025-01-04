import { type Question, type Survey, surveySchema, type SurveySchemaType } from '@/types/entities';
import type { RequestHandler } from '@sveltejs/kit';
import { db } from '@/server/db';
import * as table from '@/server/db/schema';
import { eq } from 'drizzle-orm';
import lodash from 'lodash';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	const survey = (await request.json()) as Survey;
	if (!survey || !survey.id) {
		return new Response('Invalid data', { status: 400 });
	}

	const existingSurvey = await db.query.surveys.findFirst({
		where: eq(table.surveys.id, survey.id)
	});

	if (!existingSurvey || existingSurvey.userId !== locals.user.id) {
		return new Response('Survey not found', { status: 404 });
	}

	await updateSurvey(survey);

	return new Response('Success', { status: 200 });
};

const updateSurvey = (updatedSurvey: Survey) =>
	db.transaction(async (tx) => {
		await tx
			.update(table.surveys)
			.set({
				...updatedSurvey
			})
			.where(eq(table.surveys.id, updatedSurvey.id));

		for (const question of updatedSurvey.questions ?? []) {
			await tx
				.update(table.questions)
				.set({
					...question,
					surveyId: updatedSurvey.id
				})
				.where(eq(table.questions.id, question.id));

			for (const option of question.options ?? []) {
				await tx
					.update(table.options)
					.set({
						...option,
						questionId: question.id
					})
					.where(eq(table.options.id, option.id));
			}
		}
	});
