import {openai} from "@/server/openai";
import type {ChatCompletionMessageParam} from "openai/resources/chat/completions";
import {surveySchema, type Difficulty, type Survey} from "@/types";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import _ from "lodash";

export const getMessages: (parameters: Parameters) => ChatCompletionMessageParam[] = ({
	topic,
	difficulty,
	numberOfQuestions
}) => [
	{
		role: 'system',
		content: `
            You are a helpful assistant. Use the supplied tools to assist the user in generating a survey.
            The survey must follow these rules:
            - Questions must match the user's specified topic, number, and difficulty.
            - Use "single" answer type for questions with single correct answer, "multiple" for questions with multiple 
                correct answers and "text" for questions with text-based answers. for questions with text-based answers there is a field correctAnswer
            - Difficulty levels must match the user's specified difficulty: Easy, Medium, Hard.
            Format the survey as valid JSON.
            `
	},
	{
		role: 'user',
		content: `Generate a survey with ${numberOfQuestions} questions on the topic: ${topic}, with a difficulty of ${difficulty}.`
	}
];

export async function generateSurvey(parameters: Parameters) {
    let oldParsed: Survey | null = null;

    // Flags to track if a field has been finalized
    let titleFinalized = false;
    let descriptionFinalized = false;
    let questionsFinalized = 0;

    const stream = await openai.beta.chat.completions
        .stream({
            model: "gpt-4o",
            messages: getMessages(parameters),
            response_format: zodResponseFormat(surveySchema, "generateSurvey"),
        })
        .on("content.delta", ({ parsed }) => {
            const latestParsed = parsed as Survey | undefined;

            if (!latestParsed) return; // If JSON is not parseable yet

            // If this is the first chunk
            if (!oldParsed) {
                oldParsed = latestParsed;
                return;
            }

            // Track final states of specific fields

            // 1. Title
            if (!titleFinalized && latestParsed.title && latestParsed.title === oldParsed.title) {
                console.log("Title finished:", latestParsed.title);
                titleFinalized = true; // Mark as finalized
            }

            // 2. Description
            if (!descriptionFinalized && latestParsed.description && latestParsed.description === oldParsed.description) {
                console.log("Description finished:", latestParsed.description);
                descriptionFinalized = true; // Mark as finalized
            }

            // 3. Questions
            const oldQuestions = oldParsed.questions ?? [];
            const newQuestions = latestParsed.questions ?? [];

            if ((newQuestions.length > oldQuestions.length || newQuestions.length === parameters.numberOfQuestions) && _.isEqual(oldQuestions[questionsFinalized], newQuestions[questionsFinalized])) {
                console.log(`Question ${questionsFinalized+1} is finished: `, newQuestions.at(questionsFinalized))
                questionsFinalized += 1
            }
            
            oldParsed = latestParsed;
        })
        .on("content.done", (props) => {
            if (props.parsed) {
                console.log("\n\nFinished parsing the entire survey!");
                console.log("Final Survey Object:", props.parsed);

                // Final actions, e.g., WebSocket notification
            }
        });

    // Wait for the stream to finish
    await stream.done();

    // Retrieve the final ChatCompletion
    const completion = await stream.finalChatCompletion();

    return completion.choices[0]?.message?.parsed;
}
    interface Parameters {
        topic: string;
        difficulty: Difficulty;
        numberOfQuestions: number;
    }
