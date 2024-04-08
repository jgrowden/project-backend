import { requestAuthRegister, requestQuizCreate, requestQuizInfo, requestQuizCreateV2, clear, errorCode } from '../../wrapper';
import HTTPError from 'http-errors';

let token: string;

beforeEach(() => {
  clear();
  token = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
});

describe('Tests for POST /v1/admin/quiz', () => {
  test('Successful test.', () => {
    const returnedQuiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    expect(returnedQuiz).toStrictEqual({
      statusCode: 200,
      jsonBody: { quizId: expect.any(Number) }
    });
    expect(requestQuizInfo(token, returnedQuiz.jsonBody.quizId as number)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: returnedQuiz.jsonBody.quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        duration: 0,
        numQuestions: 0,
        questions: []
      }
    });
  });
  test('Failed test: user does not exist', () => {
    expect(requestQuizCreate(token + 'a', 'Quiz Name', 'Quiz Description')).toStrictEqual(errorCode(401));
  });
  test('Failed test: invalid quiz name characters', () => {
    expect(requestQuizCreate(token, '!nvalid Name', 'Quiz Description')).toStrictEqual(errorCode(400));
  });
  test('Failed test: quiz name is too short', () => {
    expect(requestQuizCreate(token, 'iq', 'Quiz Description')).toStrictEqual(errorCode(400));
  });
  test('Failed test: quiz name is too long', () => {
    expect(requestQuizCreate(token, 'A very long quiz name which is far too long', 'Quiz Description')).toStrictEqual(errorCode(400));
  });
  test('Failed test: duplicate quiz name', () => {
    requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    expect(requestQuizCreate(token, 'Quiz Name', 'Quiz Description')).toStrictEqual(errorCode(400));
  });
  test('Failed test: quiz description is too long', () => {
    requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    expect(requestQuizCreate(token, 'Quiz Name', 'A very, very, very, very, very, extraordinarily, tremendously, stupendously, ridiculously, anomolously, long description')).toStrictEqual(errorCode(400));
  });
});

describe('Tests for POST /v2/admin/quiz', () => {
  test('Successful test.', () => {
    const returnedQuiz = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description');
    expect(returnedQuiz).toStrictEqual({ statusCode: 200, jsonBody: { quizId: expect.any(Number) } });
  });
  test('Failed test: user does not exist', () => {
    expect(() => requestQuizCreateV2(token + 'a', 'Quiz Name', 'Quiz Description')).toThrow(HTTPError[401]);
  });
  test('Failed test: invalid quiz name characters', () => {
    expect(() => requestQuizCreateV2(token, '!nvalid Name', 'Quiz Description')).toThrow(HTTPError[400]);
  });
  test('Failed test: quiz name is too short', () => {
    expect(() => requestQuizCreateV2(token, 'iq', 'Quiz Description')).toThrow(HTTPError[400]);
  });
  test('Failed test: quiz name is too long', () => {
    expect(() => requestQuizCreateV2(token, 'A very long quiz name which is far too long', 'Quiz Description')).toThrow(HTTPError[400]);
  });
  test('Failed test: duplicate quiz name', () => {
    requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description');
    expect(() => requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description')).toThrow(HTTPError[400]);
  });
  test('Failed test: quiz description is too long', () => {
    expect(() => requestQuizCreateV2(token, 'Quiz Name', 'A very, very, very, very, very, extraordinarily, tremendously, stupendously, ridiculously, anomolously, long description')).toThrow(HTTPError[400]);
  });
});
