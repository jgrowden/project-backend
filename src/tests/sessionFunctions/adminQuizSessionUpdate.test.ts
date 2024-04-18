import HTTPError from 'http-errors';
import {
  requestAuthRegister,
  requestQuizCreateV2,
  requestQuizQuestionCreateV2,
  requestQuizSessionStart,
  requestQuizSessionUpdate,
  clear
} from '../wrapper';

let token: string;
let quizId: number;
let sessionId: number;
const AUTOSTARTNUM = 10;

beforeEach(() => {
  clear();
  token = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
  quizId = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description').jsonBody.quizId as number;
  requestQuizQuestionCreateV2(token, quizId, {
    question: 'How tall am I?',
    duration: 5,
    points: 4,
    answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }],
    thumbnailUrl: 'http://example.com/birb.jpg'
  });
  sessionId = requestQuizSessionStart(token, quizId, AUTOSTARTNUM).jsonBody.sessionId as number;
});

afterEach(() => {
  clear();
});

describe('Tests for PUT /v1/admin/quiz/{quizid}/session/{sessionid}', () => {
  test('Success', () => {
    expect(requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION')).toStrictEqual({
      statusCode: 200,
      jsonBody: {}
    });
    expect(requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN')).toStrictEqual({
      statusCode: 200,
      jsonBody: {}
    });
    expect(requestQuizSessionUpdate(token, quizId, sessionId, 'END')).toStrictEqual({
      statusCode: 200,
      jsonBody: {}
    });
  });
  test('Fail: empty token', () => {
    expect(() => requestQuizSessionUpdate('', quizId, sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[401]);
  });
  test('Fail: invalid token', () => {
    expect(() => requestQuizSessionUpdate(token + 'a', quizId, sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[401]);
  });
  test('Fail: invalid ownership', () => {
    const otherToken = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo').jsonBody.token as string;
    expect(() => requestQuizSessionUpdate(otherToken, quizId, sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[403]);
  });
  test('Fail: invalid quizId', () => {
    expect(() => requestQuizSessionUpdate(token, quizId + 1, sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[403]);
  });
  test('Fail: invalid sessionId', () => {
    expect(() => requestQuizSessionUpdate(token, quizId, sessionId + 1, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });
  test('Fail: SessionId is not a session of this quiz', () => {
    const otherQuizId = requestQuizCreateV2(token, 'New Quiz Name', 'New Quiz Description').jsonBody.quizId as number;
    expect(() => requestQuizSessionUpdate(token, otherQuizId, sessionId, 'NEXT_QUESTION')).toThrow(HTTPError[400]);
  });
  test('Fail: non-existent action', () => {
    expect(() => requestQuizSessionUpdate(token, quizId, sessionId, 'SPAGHETTI')).toThrow(HTTPError[400]);
  });
  test('Fail: invalid action on current state', () => {
    expect(() => requestQuizSessionUpdate(token, quizId, sessionId, 'GO_TO_FINAL_RESULTS')).toThrow(HTTPError[400]);
  });
});
