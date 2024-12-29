import type { RequestHandler } from '@sveltejs/kit';
import { generateQuestion } from '@/server/openai/completions/generateQuestion';

export interface GenerateQuestionDto {
	topic: string;
	surveyId: string;
	existingQuestions: string[];
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session || !locals.user) {
		return new Response('Unauthorized', { status: 401 });
	}

	try {
		const data = (await request.json()) as GenerateQuestionDto;

		const topic = data.topic;

		if (!topic) {
			return new Response('Topic is required', { status: 400 });
		}
		const surveyId = data.surveyId;

		if (!surveyId) {
			console.error('Survey ID is required');
			return new Response('Survey id is required', { status: 400 });
		}

		const existingQuestions = data.existingQuestions;
		if (!data.existingQuestions) {
			console.error('Existing questions is required to generate single questions');
			return new Response('existingQuestions is required', { status: 400 });
		}

		const openAIStream = generateQuestion({
			topic,
			existingQuestions
		});

		return new Response(openAIStream.toReadableStream());

		// const finalQuestion = {
		// 	...aiGenerationResult,
		// 	options: [] as Option[],
		// 	id: ''
		// } as Question;
		//
		// await db.transaction(async (tx) => {
		// 	const [dbQuestion] = await tx
		// 		.insert(table.questions)
		// 		.values({
		// 			...aiGenerationResult,
		// 			surveyId: survey.id
		// 		})
		// 		.returning({ id: table.questions.id });
		//
		// 	finalQuestion.id = dbQuestion.id;
		//
		// 	if (!dbQuestion) {
		// 		throw new Error('Failed to insert question');
		// 	}
		//
		// 	for (const option of aiGenerationResult.options) {
		// 		const [dbOption] = await tx
		// 			.insert(table.options)
		// 			.values({
		// 				...option,
		// 				questionId: dbQuestion.id
		// 			})
		// 			.returning({ id: table.options.id });
		// 		finalQuestion.options.push({ ...option, id: dbOption.id });
		// 	}
		// });
	} catch (e) {
		console.error(e);
		return new Response('An error has occurred while generating.', { status: 500 });
	}
};
