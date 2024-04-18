import HTTPError from 'http-errors';
import {
  requestAuthRegister,
  requestQuizCreateV2,
  requestQuizQuestionCreateV2,
  requestQuizSessionStart,
  requestQuizSessionPlayerJoin,
  requestQuizSessionPlayerAnswer,
  requestQuizSessionUpdate,
  requestClear
} from '../wrapper';

import {
  hash
} from '../../helper';

let token: string;
let quizId: number;
let sessionId: number;
const AUTOSTARTNUM = 10;
let playerId: number;
let answerId: number;

beforeEach(() => {
  requestClear();
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
  playerId = requestQuizSessionPlayerJoin(sessionId, 'John Smith').jsonBody.playerId as number;
  requestQuizSessionUpdate(token, quizId, sessionId, 'NEXT_QUESTION');
  requestQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
  answerId = hash(3);
});

afterEach(() => {
  requestClear();
});

describe('Tests for PUT /v1/player/{playerid}/question/{questionposition}/answer', () => {
  test('Success', () => {
    expect(requestQuizSessionPlayerAnswer(playerId, 1, [answerId])).toStrictEqual({
      statusCode: 200,
      jsonBody: {}
    });
  });
  test('Fail: player id does not exist', () => {
    expect(() => requestQuizSessionPlayerAnswer(playerId + 1, 1, [answerId])).toThrow(HTTPError[400]);
  });
  test('Fail: invalid question position', () => {
    expect(() => requestQuizSessionPlayerAnswer(playerId, -1, [answerId])).toThrow(HTTPError[400]);
  });
  test('Fail: session is not in QUESTION_OPEN state', () => {
    requestQuizSessionUpdate(token, quizId, sessionId, 'END');
    expect(() => requestQuizSessionPlayerAnswer(playerId, 1, [answerId])).toThrow(HTTPError[400]);
  });
  test('Fail: session is not up to this question yet', () => {
    expect(() => requestQuizSessionPlayerAnswer(playerId, 2, [answerId])).toThrow(HTTPError[400]);
  });
  test('Fail: invalid answerId for this question', () => {
    expect(() => requestQuizSessionPlayerAnswer(playerId, 1, [answerId + 1])).toThrow(HTTPError[400]);
  });
  test('Fail: duplicate answer ids provided', () => {
    expect(() => requestQuizSessionPlayerAnswer(playerId, 1, [answerId, answerId])).toThrow(HTTPError[400]);
  });
  test('Fail: Not enough answer ids provided (1)', () => {
    expect(() => requestQuizSessionPlayerAnswer(playerId, 1, [])).toThrow(HTTPError[400]);
  });
});
