import { clear } from '../other';
import { adminQuizList, adminQuizCreate } from '../quiz';
import { adminAuthRegister } from '../auth';

describe('adminQuizList', () => {
  beforeEach(() => {
    clear();
  });
  test('returning list of quizzes', () => {
    const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    const quizId1 = adminQuizCreate(userId.authUserId, 'quiz1', 'the first quiz');
    const quizId2 = adminQuizCreate(userId.authUserId, 'quiz2', 'the second quiz');
    expect(adminQuizList(userId.authUserId)).toStrictEqual({
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
    const userId1 = adminAuthRegister('email1@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    const userId2 = adminAuthRegister('email2@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    const quizId1 = adminQuizCreate(userId1.authUserId, 'quiz1', 'the first quiz');
    const quizId2 = adminQuizCreate(userId2.authUserId, 'quiz2', 'the second quiz');
    const quizId3 = adminQuizCreate(userId1.authUserId, 'quiz3', 'the third quiz');
    expect(adminQuizList(userId1.authUserId)).toStrictEqual({
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
    expect(adminQuizList(userId2.authUserId)).toStrictEqual({
      quizzes: [
        {
          quizId: quizId2.quizId,
          name: 'quiz2',
        }
      ]
    });
  });
  test('returning empty list of quizzes', () => {
    const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    expect(adminQuizList(userId.authUserId)).toStrictEqual({
      quizzes: []
    });
  });
  test('invalid authUserId', () => {
    expect(adminQuizList(1)).toMatchObject({ error: expect.any(String) });
  });
});
