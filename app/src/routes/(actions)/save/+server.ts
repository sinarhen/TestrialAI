import type { Survey } from "@/types/entities";
import type { RequestHandler } from "@sveltejs/kit";
import { db } from "@/server/db";
import { questions, options } from "@/server/db/schema";
import { sql, and, eq, notInArray, inArray } from "drizzle-orm";

export const POST: RequestHandler = async ({ request, locals }) => {
  if (!locals.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const survey = (await request.json()) as Survey;
  if (!survey) {
    return new Response("Invalid data", { status: 400 });
  }

  await db.transaction(async (tx) => {
    await tx
      .insert(questions)
      .values(
        survey.questions.map((q) => ({
          id: q.id,
          surveyId: survey.id,
          question: q.question,
          answerType: q.answerType,
          correctAnswer: q.correctAnswer,
        }))
      )
      .onConflictDoUpdate({
        target: questions.id,
        set: {
          surveyId: sql`excluded.survey_id`,
          question: sql`excluded.question`,
          answerType: sql`excluded.answer_type`,
          correctAnswer: sql`excluded.correct_answer`,
        },
      });

    await tx
      .insert(options)
      .values(
        survey.questions.flatMap((q) =>
          q.options.map((o) => ({
            id: o.id,
            questionId: q.id,
            value: o.value,
            isCorrect: o.isCorrect,
          }))
        )
      )
      .onConflictDoUpdate({
        target: options.id,
        set: {
          questionId: sql`excluded.question_id`,
          value: sql`excluded.value`,
          isCorrect: sql`excluded.is_correct`,
        },
      });

    const questionIds = survey.questions.map((q) => q.id);
    const optionIds = survey.questions.flatMap((q) =>
      q.options.map((o) => o.id)
    );

    // Delete old options
    await tx.delete(options).where(
      and(
        inArray(
          options.questionId,
          sql`(SELECT id FROM ${questions} WHERE ${eq(questions.surveyId, survey.id)})`
        ),
        notInArray(options.id, optionIds)
      )
    );

    // Delete old questions
    await tx.delete(questions).where(
      and(eq(questions.surveyId, survey.id), notInArray(questions.id, questionIds))
    );
  });

  return new Response("Survey saved successfully", { status: 200 });
};