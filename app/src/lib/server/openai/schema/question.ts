import type { ResponseFormatJSONSchema } from "openai/src/resources/index.js";


export const generateQuestionSchema: ResponseFormatJSONSchema.JSONSchema = {
    "name": "generate_question",
    "strict": true,
    schema: {
        "type": "object",
        "required": [
            "question",
            "answerType",
            "options",
            "correctAnswer"
        ],
        "properties": {
            "question": {
                "type": "string",
                "description": "The text of the question"
            },
            "answerType": {
                "type": "string",
                "enum": [
                    "single",
                    "multiple",
                    "text"
                ],
                "description": "The type of answer expected (single or multiple choice)"
            },
            "correctAnswer": {
                "type": "string",
                "description": "The correct answer to the question if it is a text-based answer"
            },
            "options": {
                "type": "array",
                "description": "Possible answers for the question",
                "items": {
                    "type": "object",
                    "required": [
                        "value",
                        "isCorrect"
                    ],
                    "properties": {
                        "value": {
                            "type": "string",
                            "description": "An answer option"
                        },
                        "isCorrect": {
                            "type": "boolean",
                            "description": "Indicates whether the option is correct"
                        }
                    },
                    "additionalProperties": false
                }
            }
        },
        "additionalProperties": false
    }
}