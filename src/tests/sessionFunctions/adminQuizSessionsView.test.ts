import HTTPError from 'http-errors';
import { QuestionType } from '../../dataStore';
import {
  clear,
  requestAuthRegister,
  requestQuizCreateV2,
  requestQuizQuestionCreateV2,
  requestQuizSessionStart,
  requestQuizDelete,
  requestQuizSessionsView,
  requestQuizSessionAnswer,
} from '../wrapper';

let token: string, quizId: number;
let AUTOSTARTNUM = 10;
beforeEach(() => {
  clear();
  token = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs').jsonBody.token as string;
  quizId = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description').jsonBody.quizId as number;
});
afterAll(() => {
  clear();
});

describe('adminQuizSessionsView', () => {
  test('401, invalid/empty token', () => {
    expect(() => requestQuizSessionsView('', quizId)).toThrow(HTTPError[401]);
    expect(() => requestQuizSessionsView(token + '1', quizId)).toThrow(HTTPError[401]);
  });
  test('403, valid token, invalid quizId', () => {
    expect(() => requestQuizSessionsView(token, quizId + 1)).toThrow(HTTPError[403]);
    const newToken = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
    const newQuizId = requestQuizCreateV2(newToken, 'New Quiz', 'Description').jsonBody.quizId as number;
    expect(() => requestQuizSessionsView(token, newQuizId)).toThrow(HTTPError[403]);
  });
  test('200, success', () => {
    const session1 = requestQuizSessionStart(token, quizId, AUTOSTARTNUM).jsonBody.sessionId as number;
    const session2 = requestQuizSessionStart(token, quizId, AUTOSTARTNUM).jsonBody.sessionId as number;
    const session3 = requestQuizSessionStart(token, quizId, AUTOSTARTNUM).jsonBody.sessionId as number;
    requestQuizSessionAnswer(token, quizId, session1, 'END');
    expect(requestQuizSessionsView(token, quizId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        activeSessions: [
          session2, 
          session3
        ],
        inactiveSessions: [
          session1
        ]
      }
    });
  });
})