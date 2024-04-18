import HTTPError from 'http-errors';
import {
  requestAuthRegister,
  requestQuizCreateV2,
  requestQuizQuestionCreateV2,
  requestQuizSessionStart,
  requestQuizSessionPlayerJoin,
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

describe('Testing for POST /v1/player/join:', () => {
  test('Success', () => {
    expect(requestQuizSessionPlayerJoin(sessionId, 'John Smith')).toStrictEqual({
      statusCode: 200,
      jsonBody: { playerId: expect.any(Number) }
    });
  });
  test('Success: no name provided', () => {
    expect(requestQuizSessionPlayerJoin(sessionId, '')).toStrictEqual({
      statusCode: 200,
      jsonBody: { playerId: expect.any(Number) }
    });
  });
  test('Fail: Name given is not unique', () => {
    requestQuizSessionPlayerJoin(sessionId, 'John Smith');
    expect(() => requestQuizSessionPlayerJoin(sessionId, 'John Smith')).toThrow(HTTPError[400]);
  });
  test('Fail: Invalid SessionId', () => {
    expect(() => requestQuizSessionPlayerJoin(sessionId + 1, 'John Smith')).toThrow(HTTPError[400]);
  });
  test('Fail: Session is not in LOBBY state', () => {
    expect(() => requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION')).not.toThrow(HTTPError[400]);
    expect(() => requestQuizSessionPlayerJoin(sessionId, 'John Smith')).toThrow(HTTPError[400]);
  });
});

clear();
