import {Difficulties} from "@/types";
import type { ResponseFormatJSONSchema } from "openai/src/resources/shared.js";
import { generateQuestionSchema } from "./question";

export const generateSurveySchema: ResponseFormatJSONSchema.JSONSchema = {
    "name": "generate_survey",
    "strict": true,
    "schema": {
        "type": "object",
        "required": [
            "title",
            "description",
            "difficulty",
            "questions"
        ],
        "properties": {
            "title": {
                "type": "string",
                "description": "The title of the survey"
            },
            "description": {
                "type": "string",
                "description": "A brief description of the survey purpose"
            },
            "difficulty": {
                "type": "string",
                "enum": [
                    Difficulties.EASY,
                    Difficulties.MEDIUM,
                    Difficulties.HARD
                ],
                "description": "The overall difficulty level of the survey (Easy, Medium, Hard)"
            },
            "questions": {
                "type": "array",
                "description": "A list of questions included in the survey",
                "items": {
                    ...generateQuestionSchema.schema
                }
            }
        },
        "additionalProperties": false
    }
}
