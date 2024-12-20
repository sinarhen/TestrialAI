import {Difficulties} from "@/types";

export const generateSurveySchema = {
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
        },
        "additionalProperties": false
    }
}
