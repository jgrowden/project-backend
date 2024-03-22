import { requestAuthRegister, requestAuthLogin, requestQuizCreate, requestQuizList, clear, ERROR } from './wrapper';

describe('adminQuizList', () => {
  beforeEach(() => {
    clear();
  });
  test('returning list of quizzes', () => {
    const userId = requestAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    const quizId1 = requestQuizCreate(userId.token, 'quiz1', 'the first quiz');
    const quizId2 = requestQuizCreate(userId.token, 'quiz2', 'the second quiz');
    expect(requestQuizList(userId.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId1.quizId,
          name: 'quiz1',
        },
        {
          quizId: quizId2.quizId,
          name: 'quiz2',
        }
      ]
    });
  });
  test('returning list of quizzes for multiple users', () => {
    const userId1 = requestAuthRegister('email1@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    const userId2 = requestAuthRegister('email2@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    const quizId1 = requestQuizCreate(userId1.token, 'quiz1', 'the first quiz');
    const quizId2 = requestQuizCreate(userId2.token, 'quiz2', 'the second quiz');
    const quizId3 = requestQuizCreate(userId1.token, 'quiz3', 'the third quiz');
    expect(requestQuizList(userId1.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId1.quizId,
          name: 'quiz1',
        },
        {
          quizId: quizId3.quizId,
          name: 'quiz3',
        }
      ]
    });
    expect(requestQuizList(userId2.token)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId2.quizId,
          name: 'quiz2',
        }
      ]
    });
  });
  test('returning empty list of quizzes', () => {
    const userId = requestAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    expect(requestQuizList(userId.token)).toStrictEqual({
      quizzes: []
    });
  });
  test('invalid token', () => {
    const userId = requestAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    clear();
    expect(requestQuizList(userId.token))
    .toStrictEqual({ statusCode: 400, jsonBody: ERROR });
  });
});
