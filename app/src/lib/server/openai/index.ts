import OpenAI from "openai";
import {OPENAI_API_KEY} from "$env/static/private";
import type { ChatCompletionCreateParams } from "openai/resources/index.mjs";
import type { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod.mjs";

export const openai = new OpenAI({
    apiKey: OPENAI_API_KEY
});

// const createCompletion = async ({
//     model = "gpt-4o",
//     ...params
// }: ChatCompletionCreateParams, schema: z.AnyZodObject) => {
//     const resp = await openai.chat.completions.create({
//         model,
//         ...params
//     }) as OpenAI.Chat.ChatCompletion;
//     const content = resp.choices?.[0]?.message?.content;

//     if (!content) {
//         throw new Error('No content in response');
//     }
    
//     const parsed = await schema.safeParseAsync(JSON.parse(content));

//     if (!parsed.success) {
//         throw new Error('Failed to parse response');
//     }

//     return parsed.data;
// }
