import { adminQuizCreate, adminQuizInfo } from '../../quiz';
import { clear } from '../../other';
import { adminAuthRegister } from '../../auth';

clear();
beforeEach(() => {
  clear();
});

describe('adminQuizInfo test cases', () => {
  describe('success cases', () => {
    test('correct return type', () => {
      const user = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      const quiz = adminQuizCreate(user.token, 'quiz name', 'quiz description');
      expect(adminQuizInfo(user.token, quiz.quizId)).toMatchObject({
        quizId: quiz.quizId,
        name: 'quiz name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'quiz description',
      });
    });
  });
  describe('failure cases', () => {
    test('check for invalid user ID', () => {
      expect(adminQuizInfo(-1, 1))
        .toMatchObject({ error: expect.any(String) });
    });
    test('Check for invalid quiz ID', () => {
      const user = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      expect(adminQuizInfo(user.token, -1))
        .toMatchObject({ error: expect.any(String) });
    });
    test('Check for valid quiz ownership', () => {
      const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      const user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
      const user2quiz = adminQuizCreate(user2.token, 'quiz name', 'quiz description');
      expect(adminQuizInfo(user1.token, user2quiz.quizId))
        .toMatchObject({ error: expect.any(String) });
    });
  });
});
