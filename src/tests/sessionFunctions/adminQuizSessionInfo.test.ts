import HTTPError from 'http-errors';
import { QuestionType } from '../../dataStore';
import {
  clear,
  requestAuthRegister,
  requestQuizCreate,
  requestQuizSessionStart,
  requestQuizSessionInfo,
  requestQuizSessionUpdate,
  requestQuizQuestionCreateV2
} from '../wrapper';

beforeEach(() => {
  clear();
});
afterEach(() => {
  clear();
});

let quizId1: number;
let quizId2: number;
let token1: string;
let token2: string;
let sessionId1: number;
let sessionId2: number;
let questionBody: QuestionType;
const AUTOSTARTNUM = 10;

describe('adminQuizSessionInfo testing', () => {
  beforeEach(() => {
    const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
    const user2 = requestAuthRegister('test@testmail.com', 'Password123', 'First', 'Last');
    token1 = user.jsonBody.token as string;
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
      thumbnailUrl: 'http://sus.com/sus.jpg'
    };

    requestQuizQuestionCreateV2(token1, quizId1, questionBody).jsonBody.questionId as number;
    sessionId1 = requestQuizSessionStart(token1, quizId1, AUTOSTARTNUM).jsonBody.sessionId as number;
    sessionId2 = requestQuizSessionStart(token1, quizId1, AUTOSTARTNUM).jsonBody.sessionId as number;
  });

  test('invalid tokens', () => {
    expect(() => requestQuizSessionInfo('', quizId1, sessionId1)).toThrow(HTTPError[401]);
    expect(() => requestQuizSessionInfo(token1 + '1', quizId1, sessionId1)).toThrow(HTTPError[401]);
  });
  test('quiz not found', () => {
    // this calculation has no integer solutions.
    const uniqueQuizId = quizId1 * quizId1 + quizId2 * quizId2 + quizId1 + quizId2;
    expect(() => requestQuizSessionInfo(token1, uniqueQuizId, sessionId1)).toThrow(HTTPError[403]);
  });
  test('not an owner of the quiz', () => {
    expect(() => requestQuizSessionInfo(token2, quizId1, sessionId1)).toThrow(HTTPError[403]);
  });
  test('session does not exist for a quiz', () => {
    expect(() => requestQuizSessionInfo(token1, quizId2, sessionId1)).toThrow(HTTPError[400]);
  });
  test('successfully get info of two quizzes', () => {
    expect(requestQuizSessionInfo(token1, quizId1, sessionId1)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
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
                thumbnailUrl: 'http://sus.com/sus.jpg',
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
      }
    );

    expect(requestQuizSessionInfo(token1, quizId1, sessionId2)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
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
                thumbnailUrl: 'http://sus.com/sus.jpg',
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
      }
    );
  });
  test('successfully get info an updated quiz', () => {
    const action = 'NEXT_QUESTION';
    expect(requestQuizSessionUpdate(token1, quizId1, sessionId1, action)).toStrictEqual({
      statusCode: 200,
      jsonBody: {}
    });
    expect(requestQuizSessionInfo(token1, quizId1, sessionId1)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          state: 'QUESTION_COUNTDOWN',
          atQuestion: 1,
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
                thumbnailUrl: 'http://sus.com/sus.jpg',
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
      }
    );

    expect(requestQuizSessionInfo(token1, quizId1, sessionId2)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
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
                thumbnailUrl: 'http://sus.com/sus.jpg',
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
      }
    );
  });
});
