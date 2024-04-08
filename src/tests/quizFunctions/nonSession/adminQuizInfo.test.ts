import { requestAuthRegister, requestQuizCreate, requestQuizInfo, clear, errorCode } from '../../wrapper';

import { requestAuthRegister, requestQuizCreate, requestQuizInfo, clear, errorCode, requestQuizCreateV2, requestQuizInfoV2 } from '../wrapper';
import HTTPError from 'http-errors';

let token: string;
let quizId: number;

describe('Testing GET /v1/admin/quiz/{quizid}:', () => {
  beforeEach(() => {
    clear();
    const user = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    token = user.jsonBody.token as string;
    const quiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    quizId = quiz.jsonBody.quizId as number;
  });

  test('Successful test.', () => {
    const requestedInfo = requestQuizInfo(token, quizId);
    expect(requestedInfo).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        numQuestions: 0,
        questions: [],
        duration: 0
      }
    });
  });
  test('Failed test: user does not exist.', () => {
    expect(requestQuizInfo(token + 'a', quizId)).toStrictEqual(errorCode(401));
  });
  test('Failed test: quiz does not exist.', () => {
    expect(requestQuizInfo(token, quizId + 1)).toStrictEqual(errorCode(403));
  });
  test('Failed test: user provided does not own quiz.', () => {
    const { jsonBody } = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    const otherToken = jsonBody.token as string;
    expect(requestQuizInfo(otherToken, quizId)).toStrictEqual(errorCode(403));
  });
});

describe('Testing GET /v2/admin/quiz/{quizid}:', () => {
  beforeEach(() => {
    clear();
    const user = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    token = user.jsonBody.token as string;
    const quiz = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description');
    quizId = quiz.jsonBody.quizId as number;
  });

  test('Successful test.', () => {
    const requestedInfo = requestQuizInfoV2(token, quizId);
    expect(requestedInfo).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: ''
      }
    });
  });
  test('Failed test: user does not exist.', () => {
    expect(() => requestQuizInfoV2(token + 'a', quizId)).toThrow(HTTPError[401]);
  });
  test('Failed test: quiz does not exist.', () => {
    expect(() => requestQuizInfoV2(token, quizId + 1)).toThrow(HTTPError[403]);
  });
  test('Failed test: user provided does not own quiz.', () => {
    const otherToken = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo').jsonBody.token as string;
    expect(() => requestQuizInfoV2(otherToken, quizId)).toThrow(HTTPError[403]);
  });
});
