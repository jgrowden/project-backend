import { ERROR, clear, requestAuthRegister, requestQuizCreate, requestQuizDelete, requestQuizTrashInfo } from '../wrapper';

let token1: string;
let token2: string;
let quiz1: number;
let quiz2: number;
let quiz3: number;

beforeEach(() => {
  clear();
  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').jsonBody.token;
});

describe('adminQuizTrashList testing', () => {
  // if sess id is invalid, return error 401
  test('invalid session id', () => {
    expect(requestQuizTrashInfo(token1 + '1')).toStrictEqual({ statusCode: 401, jsonBody: ERROR });
  });
  // if none, return quizzes: []. login with a user
  test('no quizzes in trash', () => {
    expect(requestQuizTrashInfo(token1)).toStrictEqual({ quizzes: [] });
  });

  // if one, return one quiz. login with a user, create a quiz, then delete it.
  test('one quiz in trash', () => {
    quiz1 = requestQuizCreate(token1, 'first quiz', 'ayayayayay').jsonBody.quizId;
    expect(requestQuizTrashInfo(token1)).toStrictEqual({ quizzes: [] });
    requestQuizDelete(token1, quiz1);
    expect(requestQuizTrashInfo(token1)).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz1,
            name: 'first quiz'
          }
        ]
      }
    );
  });

  // if two, return two quizzes. probs do tomatchobject
  test('two quizzes in trash', () => {
    quiz1 = requestQuizCreate(token1, 'first quiz', 'ayayayayay').jsonBody.quizId;
    quiz2 = requestQuizCreate(token1, 'second quiz', 'yeyeyeyeye').jsonBody.quizId;
    requestQuizDelete(token1, quiz1);
    requestQuizDelete(token1, quiz2);
    expect(requestQuizTrashInfo(token1)).toStrictEqual(
      {
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
    );
  });

  test('multiple users with trashed quizzes', () => {
    token2 = requestAuthRegister('president@elsoc.net', 'elsocprez', 'elsoc', 'president').jsonBody.token;
    quiz1 = requestQuizCreate(token1, 'first quiz', 'ayayayayay').jsonBody.quizId;
    quiz2 = requestQuizCreate(token2, 'second quiz', 'yeyeyeyeye').jsonBody.quizId;
    quiz2 = requestQuizCreate(token2, 'third quiz', 'yoyoyoyoyo').jsonBody.quizId;
    requestQuizDelete(token1, quiz1);
    requestQuizDelete(token2, quiz2);
    requestQuizDelete(token2, quiz3);
    expect(requestQuizTrashInfo(token1)).toStrictEqual(
      {
        quizzes: [
          {
            quizId: quiz1,
            name: 'first quiz'
          }
        ]
      }
    );
    expect(requestQuizTrashInfo(token2)).toStrictEqual(
      {
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
    );
  });
});
