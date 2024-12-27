import { parentPort } from 'worker_threads';
import { openai } from '@/server/openai';
import { type Difficulty, type Survey, type SurveySchemaType } from '@/types';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';
import { surveySchema } from '@/types';
import _ from 'lodash';
import type { ChatCompletionMessageParam } from 'openai/resources/index.mjs';

interface WorkerPayload {
  topic: string;
  difficulty: Difficulty;
  numberOfQuestions: number;
}

type Step = "title" | "description" | "question" | "difficulty" 

type WorkerMessage =
  | {
      type: 'progress';
      payload: {
        step: Step;
        data: unknown;
      };
    }
  | {
      type: 'done';
      payload: SurveySchemaType;
    }
  | {
      type: 'error';
      payload: string;
    };

function getMessages(params: WorkerPayload): ChatCompletionMessageParam[] {
  return [
    {
      role: 'system',
      content: `
        You are a helpful assistant. Use the supplied tools to assist the user in generating a survey.
        The survey must follow these rules:
        - Questions must match the user's specified topic, number, and difficulty.
        - Use "single" answer type for single-correct-answer questions, 
          "multiple" for multiple-correct-answers, 
          "text" for text-based answers (with a "correctAnswer" field).
        - Format the survey as valid JSON.
      `
    },
    {
      role: 'user',
      content: `Generate a survey with ${params.numberOfQuestions} questions on the topic: ${params.topic}, with a difficulty of ${params.difficulty}.`
    }
  ];
}

async function runGeneration(params: WorkerPayload) {
  let oldParsed: Survey | null = null;

  let titleFinalized = false;
  let descriptionFinalized = false;
  let difficultyFinalized = false; 

  let questionsFinalized = 0;

  const stream = await openai.beta.chat.completions
    .stream({
        model: "gpt-4o",
        messages: getMessages(params),
        response_format: zodResponseFormat(surveySchema, "generateSurvey"),
    })
    .on('content.delta', ({ parsed }) => {
      const latestParsed = parsed as Survey | undefined;
      if (!latestParsed) return;

      if (!oldParsed) {
        oldParsed = latestParsed;
        return;
      }

      if (!titleFinalized && latestParsed.title && latestParsed.title === oldParsed.title) {
        titleFinalized = true;
        sendProgressMessage('title', latestParsed.title)
      }

      if (!descriptionFinalized && latestParsed.description && latestParsed.description === oldParsed.description) {
        descriptionFinalized = true;
        sendProgressMessage('description', latestParsed.description)
      }

      if (!difficultyFinalized && latestParsed.difficulty && latestParsed.difficulty === oldParsed.difficulty) {
        difficultyFinalized = true;
        sendProgressMessage('difficulty', latestParsed.difficulty)
      }


      const oldQuestions = oldParsed.questions ?? [];
      const newQuestions = latestParsed.questions ?? [];

      if (
        (questionsFinalized < params.numberOfQuestions) &&
        (newQuestions.length > oldQuestions.length || newQuestions.length === params.numberOfQuestions) &&
        _.isEqual(oldQuestions[questionsFinalized], newQuestions[questionsFinalized])
      ) {
        const question = newQuestions[questionsFinalized];
        sendProgressMessage('question', question)
        questionsFinalized += 1;
      }

      oldParsed = latestParsed;
    })
    .on('content.done', (props) => {
      if (props.parsed) {
        sendDoneMessage(props.parsed);
        }
    });

  await stream.done();

  await stream.finalChatCompletion(); 
}

parentPort?.on('message', async (params: WorkerPayload) => {
  try {
    await runGeneration(params);
  } catch (err: any) {
    sendErrorMessage(err.message);
  }
});

function sendErrorMessage (message: string) {
    parentPort?.postMessage({
        type: 'error',
        payload: message
    } as WorkerMessage)
}

function sendProgressMessage(step: Step, data: unknown){
    parentPort?.postMessage({
        type: 'progress',
        payload: {
            step,
            data
        }
    } as WorkerMessage)
}

function sendDoneMessage(survey: SurveySchemaType) {
    parentPort?.postMessage({
        type: 'done',
        payload: survey
    } as WorkerMessage)
}