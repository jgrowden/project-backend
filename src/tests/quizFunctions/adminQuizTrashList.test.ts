import {
  errorCode,
  requestClear,
  requestAuthRegister,
  requestQuizCreate,
  requestQuizDelete,
  requestQuizTrashInfo,
  requestQuizTrashInfoV2,
  requestQuizDeleteV2,
  requestQuizCreateV2
} from '../wrapper';
import HTTPError from 'http-errors';
let token1: string;
let token2: string;
let quiz1: number;
let quiz2: number;
let quiz3: number;

beforeEach(() => {
  requestClear();
  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').jsonBody.token as string;
});

describe('adminQuizTrashInfo testing', () => {
  test('invalid session id', () => {
    expect(requestQuizTrashInfo(token1 + '1')).toStrictEqual(errorCode(401));
  });

  test('no quizzes in trash', () => {
    expect(requestQuizTrashInfo(token1)).toStrictEqual({ statusCode: 200, jsonBody: { quizzes: [] } });
  });

  test('one quiz in trash', () => {
    quiz1 = requestQuizCreate(token1, 'first quiz', 'ayayayayay').jsonBody.quizId as number;
    expect(requestQuizTrashInfo(token1)).toStrictEqual({ statusCode: 200, jsonBody: { quizzes: [] } });
    requestQuizDelete(token1, quiz1);
    expect(requestQuizTrashInfo(token1)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          quizzes: [
            {
              quizId: quiz1,
              name: 'first quiz'
            }
          ]
        }
      }
    );
  });

  test('two quizzes in trash', () => {
    quiz1 = requestQuizCreate(token1, 'first quiz', 'ayayayayay').jsonBody.quizId as number;
    quiz2 = requestQuizCreate(token1, 'second quiz', 'yeyeyeyeye').jsonBody.quizId as number;
    requestQuizDelete(token1, quiz1);
    requestQuizDelete(token1, quiz2);
    expect(requestQuizTrashInfo(token1)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          quizzes: [
            {
              quizId: quiz1,
              name: 'first quiz'
            },
            {
              quizId: quiz2,
              name: 'second quiz'
            }
          ]
        }
      }
    );
  });

  test('multiple users with trashed quizzes', () => {
    token2 = requestAuthRegister('president@elsoc.net', 'elsocprez2024', 'elsoc', 'president').jsonBody.token as string;
    quiz1 = requestQuizCreate(token1, 'first quiz', 'ayayayayay').jsonBody.quizId as number;
    quiz2 = requestQuizCreate(token2, 'second quiz', 'yeyeyeyeye').jsonBody.quizId as number;
    quiz3 = requestQuizCreate(token2, 'third quiz', 'yoyoyoyoyo').jsonBody.quizId as number;
    requestQuizDelete(token1, quiz1);
    requestQuizDelete(token2, quiz2);
    requestQuizDelete(token2, quiz3);
    expect(requestQuizTrashInfo(token1)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          quizzes: [
            {
              quizId: quiz1,
              name: 'first quiz'
            }
          ]
        }
      }
    );
    expect(requestQuizTrashInfo(token2)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          quizzes: [
            {
              quizId: quiz2,
              name: 'second quiz'
            },
            {
              quizId: quiz3,
              name: 'third quiz'
            }
          ]
        }
      }
    );
  });
});

describe('adminQuizTrashInfo v2 testing', () => {
  test('invalid session id', () => {
    expect(() => requestQuizTrashInfoV2(token1 + '1')).toThrow(HTTPError[401]);
  });

  test('no quizzes in trash', () => {
    expect(requestQuizTrashInfoV2(token1)).toStrictEqual({ statusCode: 200, jsonBody: { quizzes: [] } });
  });

  test('one quiz in trash', () => {
    quiz1 = requestQuizCreateV2(token1, 'first quiz', 'ayayayayay').jsonBody.quizId as number;
    expect(requestQuizTrashInfoV2(token1)).toStrictEqual({ statusCode: 200, jsonBody: { quizzes: [] } });
    requestQuizDeleteV2(token1, quiz1);
    expect(requestQuizTrashInfoV2(token1)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          quizzes: [
            {
              quizId: quiz1,
              name: 'first quiz'
            }
          ]
        }
      }
    );
  });

  test('two quizzes in trash', () => {
    quiz1 = requestQuizCreateV2(token1, 'first quiz', 'ayayayayay').jsonBody.quizId as number;
    quiz2 = requestQuizCreateV2(token1, 'second quiz', 'yeyeyeyeye').jsonBody.quizId as number;
    requestQuizDeleteV2(token1, quiz1);
    requestQuizDeleteV2(token1, quiz2);
    expect(requestQuizTrashInfoV2(token1)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          quizzes: [
            {
              quizId: quiz1,
              name: 'first quiz'
            },
            {
              quizId: quiz2,
              name: 'second quiz'
            }
          ]
        }
      }
    );
  });

  test('multiple users with trashed quizzes', () => {
    token2 = requestAuthRegister('president@elsoc.net', 'elsocprez2024', 'elsoc', 'president').jsonBody.token as string;
    quiz1 = requestQuizCreateV2(token1, 'first quiz', 'ayayayayay').jsonBody.quizId as number;
    quiz2 = requestQuizCreateV2(token2, 'second quiz', 'yeyeyeyeye').jsonBody.quizId as number;
    quiz3 = requestQuizCreateV2(token2, 'third quiz', 'yoyoyoyoyo').jsonBody.quizId as number;
    requestQuizDeleteV2(token1, quiz1);
    requestQuizDeleteV2(token2, quiz2);
    requestQuizDeleteV2(token2, quiz3);
    expect(requestQuizTrashInfoV2(token1)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          quizzes: [
            {
              quizId: quiz1,
              name: 'first quiz'
            }
          ]
        }
      }
    );
    expect(requestQuizTrashInfoV2(token2)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          quizzes: [
            {
              quizId: quiz2,
              name: 'second quiz'
            },
            {
              quizId: quiz3,
              name: 'third quiz'
            }
          ]
        }
      }
    );
  });
});
