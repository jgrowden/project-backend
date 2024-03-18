import { adminQuizCreate, adminQuizRemove } from '../quiz';
import { clear } from '../other';
import { adminAuthRegister } from '../auth';

clear();
beforeEach(() => {
  clear();
});

describe('adminQuizRemove test cases', () => {
  describe('success cases', () => {
    test('correct return type', () => {
      const user = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      const quiz = adminQuizCreate(user.sessionId, 'quiz name', 'quiz description');
      expect(adminQuizRemove(user.sessionId, quiz.quizId)).toMatchObject({ });
    });
  });
  describe('failure cases', () => {
    test('check for invalid user ID', () => {
      expect(adminQuizRemove(-1, 1))
        .toMatchObject({ error: expect.any(String) });
    });
    test('Check for invalid quiz ID', () => {
      const user = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      expect(adminQuizRemove(user.sessionId, -1))
        .toMatchObject({ error: expect.any(String) });
    });
    test('Check for valid quiz ownership', () => {
      const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      const user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
      const user2quiz = adminQuizCreate(user2.sessionId, 'quiz name', 'quiz description');
      expect(adminQuizRemove(user1.sessionId, user2quiz.quizId))
        .toMatchObject({ error: expect.any(String) });
    });
  });
});
