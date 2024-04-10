import HTTPError from 'http-errors';
import { QuestionType } from '../../dataStore';
import {
  clear,
  requestAuthRegister,
  requestQuizCreate,
  requestQuizQuestionCreate,
  requestQuizSessionStart,
  requestQuizDelete,
  requestQuizSessionInfo,
  requestQuizInfo,
  requestQuizQuestionCreateV2
} from '../wrapper';
import { string } from 'yaml/dist/schema/common/string';

beforeEach(() => {
  clear();
})
afterEach(() => {
  clear();
})

let quizId1: number;
let quizId2: number;
let token1: string;
let token2: string;
let sessionId: number;
let questionBody: QuestionType;
let questionId1: number;
const AUTOSTARTNUM = 10;

describe('adminQuizSessionInfo testing', () => {

  beforeEach(() => {
    const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
    const user2 = requestAuthRegister('test@testmail.com', 'Password123', 'First', 'Last');
    token1 = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs').jsonBody.token as string;
    token2 = user2.jsonBody.token as string;

    const quiz1 = requestQuizCreate(token1, 'Quiz Name', 'Quiz Description');
    const quiz2 = requestQuizCreate(token1, 'Second Quiz Name', 'Second Quiz Description');
    quizId1 = quiz1.jsonBody.quizId as number;
    quizId2 = quiz2.jsonBody.quizId as number;

    questionBody = {
      question: 'Who is the imposter?',
      duration: 10,
      points: 10,
      answers: [
        {
          answer: 'Red',
          correct: false,
        },
        {
          answer: 'Blue',
          correct: false,
        },
        {
          answer: 'Green',
          correct: false,
        },
        {
          answer: 'Orange',
          correct: true,
        },
      ],
    };

    questionId1 = requestQuizQuestionCreateV2(token1, quizId1, questionBody).jsonBody.questionId as number;

    sessionId = requestQuizSessionStart(token1, quizId1, AUTOSTARTNUM).jsonBody.sessionId as number;
  })

  test('Invalid tokens', () => {
    expect(requestQuizSessionInfo('', quizId1, sessionId)).toThrow(HTTPError[401]);
    expect(requestQuizSessionInfo(token1 + '1', quizId1, sessionId)).toThrow(HTTPError[401]);
  })
  test('not an owner of the quiz', () => {
    expect(requestQuizSessionInfo(token2, quizId1, sessionId)).toThrow(HTTPError[403]);
  });
  test('session does not exist for a quiz', () => {
    expect(requestQuizSessionInfo(token1, quizId2, sessionId)).toThrow(HTTPError[400]);
  });
  test('successfully get info of one quiz', () => {
    expect(requestQuizSessionInfo(token1, quizId1, sessionId)).toStrictEqual(
      {
        state: 'LOBBY',
        atQuestion: 0,
        players: [],
        metadata: {
          quizId: quizId1,
          name: 'Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz Description',
          numQuestions: 1,
          questions: [
            {
              questionId: expect.any(Number),
              question: 'Who is the imposter?',
              duration: 10,
              thumbnailUrl: '',
              points: 10,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Red',
                  colour: expect.any(String),
                  correct: false
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Blue',
                  colour: expect.any(String),
                  correct: false
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Green',
                  colour: expect.any(String),
                  correct: false
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Orange',
                  colour: expect.any(String),
                  correct: true
                }
              ]
            }
          ],
          duration: 10,
          thumbnailUrl: ''
        }
      }
    )
  });
  test('successfully get info an updated quiz', () => {
    // to complete after merging master into branch
  });
})