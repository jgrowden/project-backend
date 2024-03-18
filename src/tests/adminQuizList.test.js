import { clear } from '../other';
import { adminQuizList, adminQuizCreate } from '../quiz';
import { adminAuthRegister } from '../auth';

describe('adminQuizList', () => {
  beforeEach(() => {
    clear();
  });
  test('returning list of quizzes', () => {
    const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
    const quizId1 = adminQuizCreate(userId.sessionId, 'quiz1', 'the first quiz');
    const quizId2 = adminQuizCreate(userId.sessionId, 'quiz2', 'the second quiz');
    expect(adminQuizList(userId.sessionId)).toStrictEqual({
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
    const quizId1 = adminQuizCreate(userId1.sessionId, 'quiz1', 'the first quiz');
    const quizId2 = adminQuizCreate(userId2.sessionId, 'quiz2', 'the second quiz');
    const quizId3 = adminQuizCreate(userId1.sessionId, 'quiz3', 'the third quiz');
    expect(adminQuizList(userId1.sessionId)).toStrictEqual({
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
    expect(adminQuizList(userId2.sessionId)).toStrictEqual({
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
    expect(adminQuizList(userId.sessionId)).toStrictEqual({
      quizzes: []
    });
  });
  test('invalid sessionId', () => {
    expect(adminQuizList(1)).toMatchObject({ error: expect.any(String) });
  });
});
