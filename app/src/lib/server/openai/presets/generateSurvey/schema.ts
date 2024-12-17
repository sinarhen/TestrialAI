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
                "type": "integer",
                "enum": [
                    1,
                    2,
                    3
                ],
                "description": "The overall difficulty level of the survey (1: EASY, 2: MEDIUM, 3: HARD)"
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
                        "difficulty"
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
                                "multiple"
                            ],
                            "description": "The type of answer expected (single or multiple choice)"
                        },
                        "difficulty": {
                            "type": "integer",
                            "enum": [
                                1,
                                2,
                                3
                            ],
                            "description": "The difficulty level of the question (1: EASY, 2: MEDIUM, 3: HARD)"
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
