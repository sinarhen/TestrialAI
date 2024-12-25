import { db } from "@/server/db";
import { generateSurvey } from "@/server/openai/presets/generateSurvey";
import { type Question, type QuestionSchema, type Option, type Survey, type SurveySchema } from "@/types";
import type { RequestHandler } from "@sveltejs/kit";
import * as table from "@/server/db/schema";
import { generateQuestion } from "@/server/openai/presets/generateQuestion";

export interface GenerateQuestionDto {
    topic: string;
    survey: Survey;
}

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.session || !locals.user) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const data = await request.json() as GenerateQuestionDto;
        
        const topic = data.topic;

        if (!topic) {
            return new Response("Topic is required", { status: 400 });
        }
        const survey = data.survey;
        
        if (!survey) {
            console.error("Invalid survey");
            console.dir(survey, { depth: null });
            return new Response("Invalid survey", { status: 400 });
        }

        const response = await generateQuestion({
            topic,
            currentSurvey: survey,
        });
        const content = response.choices[0].message.content;

        if (!content) {
            return new Response("An error has occurred while generating.", { status: 500 });
        }

        const aiGenerationResult = JSON.parse(content) as QuestionSchema;

        const finalQuestion = {
            ...aiGenerationResult,
            options: [] as Option[],
            id: '',
        } as Question;

        await db.transaction(async (tx) => {
            const [dbQuestion] = await tx
                .insert(table.questions)
                .values({
                    ...aiGenerationResult,
                    surveyId: survey.id,
                })
                .returning({ id: table.questions.id });
            
            finalQuestion.id = dbQuestion.id;
            
            if (!dbQuestion) {
                throw new Error("Failed to insert question");
            }

            for (const option of aiGenerationResult.options) {
                const [dbOption] = await tx.insert(table.options).values({
                    ...option,
                    questionId: dbQuestion.id,
                }).returning({ id: table.options.id });
                finalQuestion.options.push({ ...option, id: dbOption.id });
            }
        });

        return new Response(JSON.stringify(finalQuestion), { status: 200 });

    } catch (e) {
        console.error(e);
        return new Response("An error has occurred while generating.", { status: 500 });
    }
};