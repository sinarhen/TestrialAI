import { db } from "@/server/db";
import { generateSurvey } from "@/server/openai/presets/generateSurvey";
import { Difficulties, type Question, type Survey, type SurveySchema } from "@/types";
import type { RequestHandler } from "@sveltejs/kit";
import * as table from "@/server/db/schema";

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.session || !locals.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { topic } = await request.json();
    if (!topic || typeof topic !== "string") {
        return new Response("Topic is required", { status: 400 });
    }

    try {
        const openaiResponse = await generateSurvey({
            topic,
            difficulty: Difficulties.EASY,
            numberOfQuestions: 8,
        });

        const aiContent = openaiResponse.choices[0]?.message?.content;
        if (!aiContent) {
            return new Response("An error has occurred while generating.", { status: 500 });
        }
        
        const aiGeneratedSurvey = JSON.parse(aiContent) as SurveySchema;

        const finalSurvey = {
            ...aiGeneratedSurvey,
            id: '',
            questions: [] as Question[],
            createdAt: new Date(),
            updatedAt: new Date(),
        } as Survey;

        await db.transaction(async (tx) => {
            // Insert SURVEY
            const [insertedSurvey] = await tx
                .insert(table.surveys)
                .values({
                    ...aiGeneratedSurvey,
                    userId: locals.user!.id, // associate with user
                })
                .returning({ 
                    id: table.surveys.id, 
                    createdAt: table.surveys.createdAt,
                    updatedAt: table.surveys.updatedAt 
                });

            if (!insertedSurvey) {
                throw new Error("Failed to insert survey");
            }
            finalSurvey.id = insertedSurvey.id;
            finalSurvey.createdAt = insertedSurvey.createdAt;
            finalSurvey.updatedAt = insertedSurvey.updatedAt;

            // Insert QUESTIONS and OPTIONS
            for (const question of aiGeneratedSurvey.questions) {

                const [insertedQuestion] = await tx
                    .insert(table.questions)
                    .values({
                        ...question,
                        surveyId: insertedSurvey.id,
                    })
                    .returning({ 
                        id: table.questions.id
                 });

                if (!insertedQuestion) {
                    throw new Error("Failed to insert question");
                }

                const finalOptions = [];
                for (const option of question.options) {
                    const [insertedOption] = await tx
                        .insert(table.options)
                        .values({
                            // id: newOptionId,
                            ...option,
                            questionId: insertedQuestion.id,
                        })
                        .returning({ id: table.options.id });

                    if (!insertedOption) {
                        throw new Error("Failed to insert option");
                    }

                    finalOptions.push({
                        ...option,
                        id: insertedOption.id,
                    });
                }

                finalSurvey.questions.push({
                    ...question,
                    id: insertedQuestion.id,
                    options: finalOptions,
                });
            }
        });

        return new Response(JSON.stringify(finalSurvey), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        console.error(err);
        return new Response("An error has occurred while generating.", { status: 500 });
    }
};