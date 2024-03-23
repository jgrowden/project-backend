import { requestAuthRegister, requestQuizCreate, requestQuizList, clear, ERROR } from '../wrapper';

describe('adminQuizList', () => {
  beforeEach(() => {
    clear();
  });
  test('returning list of quizzes', () => {
    const user = requestAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    const token = user.jsonBody.token as string;
    const quiz1 = requestQuizCreate(token, 'quiz1', 'the first quiz');
    const quizId1 = quiz1.jsonBody.quizId as number;
    const quiz2 = requestQuizCreate(token, 'quiz2', 'the second quiz');
    const quizId2 = quiz2.jsonBody.quizId as number;
    expect(requestQuizList(token)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizzes: [
          {
            quizId: quizId1,
            name: 'quiz1',
          },
          {
            quizId: quizId2,
            name: 'quiz2',
          }
        ]
      }
    });
  });
  test('returning list of quizzes for multiple users', () => {
    const user1 = requestAuthRegister('email1@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    const token1 = user1.jsonBody.token as string;
    const user2 = requestAuthRegister('email2@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    const token2 = user2.jsonBody.token as string;
    const quiz1 = requestQuizCreate(token1, 'quiz1', 'the first quiz');
    const quizId1 = quiz1.jsonBody.quizId as number;
    const quiz2 = requestQuizCreate(token2, 'quiz2', 'the second quiz');
    const quizId2 = quiz2.jsonBody.quizId as number;
    const quiz3 = requestQuizCreate(token1, 'quiz3', 'the third quiz');
    const quizId3 = quiz3.jsonBody.quizId as number;
    expect(requestQuizList(token1)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizzes: [
          {
            quizId: quizId1,
            name: 'quiz1',
          },
          {
            quizId: quizId3,
            name: 'quiz3',
          }
        ]
      }
    });
    expect(requestQuizList(token2)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizzes: [
          {
            quizId: quizId2,
            name: 'quiz2',
          }
        ]
      }
    });
  });
  test('returning empty list of quizzes', () => {
    const user = requestAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    const token = user.jsonBody.token as string;
    expect(requestQuizList(token)).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizzes: []
      }
    });
  });
  test('invalid token', () => {
    const user = requestAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    const token = user.jsonBody.token as string;
    clear();
    expect(requestQuizList(token))
      .toStrictEqual({ statusCode: 401, jsonBody: ERROR });
  });
});
