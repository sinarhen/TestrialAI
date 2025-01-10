import { modifyQuestion } from '@/actions';
import { db } from '@/server/db';
import { questions, surveys } from '@/server/db/schema';
import { regenerateQuestionWithTool } from '@/server/openai/completions/question/tools';
import type { QuestionModificationTool } from '@/types/openai';
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export type ModifyQuestionDto = {
	// TODO: additionalPrompt?: string;
};

export const POST: RequestHandler = async ({ locals, request, params }) => {
	if (!locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}
	try {
		const questionId = params.questionId!;
		const surveyId = params.surveyId!;
		const tool = params.tool as QuestionModificationTool; // TODO: add param matcher

		const existingQuestion = await db.query.questions.findFirst({
			where: eq(questions.id, questionId),
			with: {
				survey: {
					columns: {
						userId: true,
						title: true
					}
				}
			}
		});
		if (
			!existingQuestion ||
			existingQuestion.survey.userId !== locals.user.id ||
			existingQuestion.surveyId !== surveyId
		) {
			return new Response('Not found', { status: 404 });
		}

		const openAiStream = regenerateQuestionWithTool({
			questionTopic: existingQuestion.question,
			existingQuestions: [existingQuestion.question],
			tool,
			surveyDifficulty: 'Easy', // Anyways will be moved to the scope of the question
			surveyTitle: existingQuestion.survey.title
		});

		return new Response(openAiStream.toReadableStream());
	} catch (error) {
		return new Response('Internal Server Error', { status: 500 });
	}
};
