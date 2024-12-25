import { db } from "@/server/db";
import { generateSurvey } from "@/server/openai/presets/generateSurvey";
import { Difficulties, type SurveySchema } from "@/types";
import type { RequestHandler } from "@sveltejs/kit";
import * as table from "@/server/db/schema"

export const POST: RequestHandler = async ({
    request, locals
                        }) => {
    if (!locals.session || !locals.user) {
        return new Response("Unauthorized", {status: 401});
    }
    const topic = (await request.json()).topic;

    if (!topic || typeof topic !== 'string') {
        return new Response("Topic is required", { status: 400 });
    }

    try {
        const response = await generateSurvey({
            topic,
            difficulty: Difficulties.EASY,
            numberOfQuestions: 8,
        });
        const content = response.choices[0].message.content;
        if (!content) {
            return new Response("An error has occurred while generating.", { status: 500 });
        }

        const generationResult = JSON.parse(content) as SurveySchema;


        // Start transaction
        await db.transaction(async (tx) => {
            // Insert the survey
            const [survey] = await tx.insert(table.surveys).values({
                ...generationResult,
                userId: locals.user!.id,
            }).returning({id: table.surveys.id}); // Returning the survey to get its ID

            if (!survey) {
                throw new Error("Failed to insert survey");
            }

            // Iterate over questions and insert them
            for (const question of generationResult.questions) {
                const [dbQuestion] = await tx.insert(table.questions).values({
                    ...question,
                    surveyId: survey.id,
                }).returning({id: table.questions.id}); // Returning the question to get its ID

                if (!dbQuestion) {
                    throw new Error("Failed to insert question");
                }

                // Insert options related to the question
                for (const option of question.options) {
                    await tx.insert(table.options).values({
                        ...option,
                        questionId: dbQuestion.id, // Associate with question ID
                    }).returning({id: table.options.id});
                }
            }
        });

        return new Response(content, {status: 200});
    } catch (e) {
        console.error(e);
        return new Response('An error has occurred while generating.', {status: 500});
    }

}