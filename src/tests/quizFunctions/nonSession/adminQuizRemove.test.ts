import { requestAuthRegister, requestQuizCreate, requestQuizCreateV2, requestQuizDelete, requestQuizDeleteV2, errorCode, clear } from '../wrapper';
import HTTPError from 'http-errors';

let token: string;
let quizId: number;

describe('Tests for DELETE /v1/admin/quiz/{quizid}:', () => {
  beforeEach(() => {
    clear();
    const user = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    token = user.jsonBody.token as string;
    const quiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    quizId = quiz.jsonBody.quizId as number;
  });

  test('Successful test.', () => {
    expect(requestQuizDelete(token, quizId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {}
    });
  });
  test('Failed test: user does not exist.', () => {
    expect(requestQuizDelete(token + 'a', quizId)).toStrictEqual(errorCode(401));
  });
  test('Failed test: quiz does not exist.', () => {
    expect(requestQuizDelete(token, quizId + 1)).toStrictEqual(errorCode(403));
  });
  test('Failed test: user provided does not own quiz.', () => {
    const { jsonBody } = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    const otherToken = jsonBody.token as string;
    expect(requestQuizDelete(otherToken, quizId)).toStrictEqual(errorCode(403));
  });
});

describe('Tests for DELETE /v2/admin/quiz/{quizid}:', () => {
  beforeEach(() => {
    clear();
    const user = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    token = user.jsonBody.token as string;
    const quiz = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description');
    quizId = quiz.jsonBody.quizId as number;
  });

  test('Successful test.', () => {
    expect(requestQuizDeleteV2(token, quizId)).toStrictEqual({
      statusCode: 200,
      jsonBody: {}
    });
  });
  test('Failed test: user does not exist.', () => {
    expect(() => requestQuizDeleteV2(token + 'a', quizId)).toThrow(HTTPError[401]);
  });
  test('Failed test: quiz does not exist.', () => {
    expect(() => requestQuizDeleteV2(token, quizId + 1)).toThrow(HTTPError[403]);
  });
  test('Failed test: user provided does not own quiz.', () => {
    const { jsonBody } = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    const otherToken = jsonBody.token as string;
    expect(() => requestQuizDeleteV2(otherToken, quizId)).toThrow(HTTPError[403]);
  });
  // TO TEST: CHECK QUIZ.TS
});
