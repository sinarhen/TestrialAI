import {openai} from "@/server/openai";
import type {ChatCompletionMessageParam} from "openai/resources/chat/completions";
import type {Difficulty} from "@/types";
import {generateSurveySchema} from "@/server/openai/presets/generateSurvey/schema";

const getMessages: (parameters: Parameters) => ChatCompletionMessageParam[] = ({
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
                correct answers and "text" for questions with text-based answers.
            - Difficulty levels must match the user's specified difficulty: Easy, Medium, Hard.
            Format the survey as valid JSON.
            `
	},
	{
		role: 'user',
		content: `Generate a survey with ${numberOfQuestions} questions on the topic: ${topic}, with a difficulty of ${difficulty}.`
	}
];

export function generateSurvey(parameters: Parameters) {
    return openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: getMessages(parameters),
        response_format: {
            "type": "json_schema",
            "json_schema": generateSurveySchema,
        },
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    });
}

interface Parameters {
    topic: string;
    difficulty: Difficulty;
    numberOfQuestions: number;
}
