import HTTPError from 'http-errors';
import {
  requestAuthRegister,
  requestQuizCreateV2,
  requestQuizSessionStart,
  requestQuizQuestionCreate,
  requestQuizSessionUpdate,
  requestQuizSessionPlayerJoin,
  requestPlayerQuestionPosition,
  requestClear
} from '../wrapper';
import { QuestionType } from '../../dataStore';

let token: string;
let quizId: number;
let questionId1: number;
let questionId2: number;
let questionId3: number;
let sessionId: number;
let playerId1: number;
let playerId2: number;
const AUTOSTARTNUM = 10;

beforeEach(() => {
  requestClear();
  token = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
  quizId = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description').jsonBody.quizId as number;
  const questionBody1: QuestionType = {
    question: 'Question1?',
    duration: 3,
    points: 4,
    answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
  };
  const questionBody2: QuestionType = {
    question: 'Question2?',
    duration: 3,
    points: 4,
    answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
  };
  const questionBody3: QuestionType = {
    question: 'Question3?',
    duration: 3,
    points: 4,
    answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
  };
  questionId1 = requestQuizQuestionCreate(token, quizId, questionBody1).jsonBody.questionId as number;
  questionId2 = requestQuizQuestionCreate(token, quizId, questionBody2).jsonBody.questionId as number;
  questionId3 = requestQuizQuestionCreate(token, quizId, questionBody3).jsonBody.questionId as number;
  sessionId = requestQuizSessionStart(token, quizId, AUTOSTARTNUM).jsonBody.sessionId as number;
  playerId1 = requestQuizSessionPlayerJoin(sessionId, 'marcus').jsonBody.playerId as number;
  playerId2 = requestQuizSessionPlayerJoin(sessionId, 'milk').jsonBody.playerId as number;
});

describe('Testing for GET /v1/player/{playerId}/question/{questionPosition}', () => {
  test('Success', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    expect(requestPlayerQuestionPosition(playerId1, 1)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        questionId: questionId1,
        question: 'Question1?',
        duration: 3,
        points: 4,
        answers: [
          {
            answerId: expect.any(Number),
            answer: 'Answer!',
            colour: expect.any(String),
            correct: true
          },
          {
            answerId: expect.any(Number),
            answer: 'Another Answer!',
            colour: expect.any(String),
            correct: true
          }
        ]
      }
    });
    expect(requestPlayerQuestionPosition(playerId2, 1)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        questionId: questionId1,
        question: 'Question1?',
        duration: 3,
        points: 4,
        answers: [
          {
            answerId: expect.any(Number),
            answer: 'Answer!',
            colour: expect.any(String),
            correct: true
          },
          {
            answerId: expect.any(Number),
            answer: 'Another Answer!',
            colour: expect.any(String),
            correct: true
          }
        ]
      }
    });
    requestQuizSessionUpdate(token, quizId, sessionId, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    expect(requestPlayerQuestionPosition(playerId1, 2)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        questionId: questionId2,
        question: 'Question2?',
        duration: 3,
        points: 4,
        answers: [
          {
            answerId: expect.any(Number),
            answer: 'Answer!',
            colour: expect.any(String),
            correct: true
          },
          {
            answerId: expect.any(Number),
            answer: 'Another Answer!',
            colour: expect.any(String),
            correct: true
          }
        ]
      }
    });
    expect(requestPlayerQuestionPosition(playerId2, 2)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        questionId: questionId2,
        question: 'Question2?',
        duration: 3,
        points: 4,
        answers: [
          {
            answerId: expect.any(Number),
            answer: 'Answer!',
            colour: expect.any(String),
            correct: true
          },
          {
            answerId: expect.any(Number),
            answer: 'Another Answer!',
            colour: expect.any(String),
            correct: true
          }
        ]
      }
    });
    requestQuizSessionUpdate(token, quizId, sessionId, 'GO_TO_ANSWER');
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    expect(requestPlayerQuestionPosition(playerId1, 3)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        questionId: questionId3,
        question: 'Question3?',
        duration: 3,
        points: 4,
        answers: [
          {
            answerId: expect.any(Number),
            answer: 'Answer!',
            colour: expect.any(String),
            correct: true
          },
          {
            answerId: expect.any(Number),
            answer: 'Another Answer!',
            colour: expect.any(String),
            correct: true
          }
        ]
      }
    });
    expect(requestPlayerQuestionPosition(playerId2, 3)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        questionId: questionId3,
        question: 'Question3?',
        duration: 3,
        points: 4,
        answers: [
          {
            answerId: expect.any(Number),
            answer: 'Answer!',
            colour: expect.any(String),
            correct: true
          },
          {
            answerId: expect.any(Number),
            answer: 'Another Answer!',
            colour: expect.any(String),
            correct: true
          }
        ]
      }
    });
  });
  test('Fail: Player Id does not exist', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    expect(() => requestPlayerQuestionPosition(-1, 1)).toThrow(HTTPError[400]);
  });
  test('Fail: question position is not valid for the session this player is in', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    expect(() => requestPlayerQuestionPosition(playerId1, 4)).toThrow(HTTPError[400]);
  });
  test('Fail: session is not currently on this question', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    expect(() => requestPlayerQuestionPosition(playerId1, 2)).toThrow(HTTPError[400]);
    expect(() => requestPlayerQuestionPosition(playerId2, 2)).toThrow(HTTPError[400]);
  });
  test('Fail: session is in LOBBY, QUESTION_COUNTDOWN or END state', () => {
    expect(() => requestPlayerQuestionPosition(playerId1, 1)).toThrow(HTTPError[400]);
    expect(() => requestPlayerQuestionPosition(playerId2, 1)).toThrow(HTTPError[400]);
    requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
    expect(() => requestPlayerQuestionPosition(playerId1, 1)).toThrow(HTTPError[400]);
    expect(() => requestPlayerQuestionPosition(playerId2, 1)).toThrow(HTTPError[400]);
    requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
    requestQuizSessionUpdate(token, quizId, sessionId, 'END');
    expect(() => requestPlayerQuestionPosition(playerId1, 1)).toThrow(HTTPError[400]);
    expect(() => requestPlayerQuestionPosition(playerId2, 1)).toThrow(HTTPError[400]);
  });
});
