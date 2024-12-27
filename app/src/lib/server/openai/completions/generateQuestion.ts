import type {ChatCompletionMessageParam} from "openai/resources/chat/completions";
import {questionSchema, type Survey} from "@/types";
import { zodResponseFormat } from "openai/helpers/zod.mjs";
import { openai } from "..";

const getMessages: (parameters: Parameters) => ChatCompletionMessageParam[] = ({
	topic,
    currentSurvey
}) => [
	{
		role: 'system',
		content: `
            You are a helpful assistant. Use the supplied tools to assist the user in generating a question to existing survey.
            The survey must follow these rules:
            - Question must match the user's specified topic, and difficulty.
            - Use "single" answer type for question with single correct answer, "multiple" for question with multiple 
                correct answers and "text" for questions with text-based answers. for question with text-based answers there is a field correctAnswer
            - Difficulty levels must match the user's specified difficulty: Easy, Medium, Hard.
            Format the survey as valid JSON.
            `
	},
	{
		role: 'user',
		content: `Generate a question about ${topic} to the existing survey with the title: ${currentSurvey.title}, with a difficulty of ${currentSurvey.difficulty}.
            Do not create any question that is too similar to the following existing questions:
            ${currentSurvey.questions.map(question => question.question).join(', ')}.
        `
	}
];

export async function generateQuestion(parameters: Parameters) {
    const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o",
        messages: getMessages(parameters),
        response_format: zodResponseFormat(questionSchema, "generateQuestion"),
        temperature: 1,
        max_completion_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
    });

    const message = completion.choices[0]?.message;
    return message?.parsed;
}

interface Parameters {
    topic: string;
    currentSurvey: Survey;
}
