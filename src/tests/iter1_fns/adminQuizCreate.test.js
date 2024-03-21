import { adminQuizCreate, adminQuizInfo } from '../../quiz';
import { clear } from '../../other';
import { adminAuthRegister } from '../../auth';

clear();
beforeEach(() => {
  clear();
});

describe('adminQuizCreate test cases', () => {
  describe('success cases', () => {
    test('correct return type', () => {
      const userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      expect(adminQuizCreate(userId.token, 'Quiz Name', 'Quiz Description')).toStrictEqual({ quizId: expect.any(Number) });
    });
    test('successfully written to database', () => {
      const userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      const quiz = adminQuizCreate(userId.token, 'Quiz Name', 'Quiz Description');
      expect(adminQuizInfo(userId.token, quiz.quizId)).toStrictEqual(
        {
          quizId: quiz.quizId,
          name: 'Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz Description',
        }
      );
    });
  });
  describe('failure cases', () => {
    test('check for invalid user type', () => {
      expect(adminQuizCreate(-1, 'Quiz Name', 'Quiz Description'))
        .toStrictEqual({ error: expect.any(String) });
    });
    test('Check for valid quiz name characters', () => {
      const userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      expect(adminQuizCreate(userId.token, '!nvalid Name', 'Quiz Description'))
        .toStrictEqual({ error: expect.any(String) });
    });
    test('Check for valid quiz name length', () => {
      const userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      expect(adminQuizCreate(userId.token, 'iq', 'Quiz Description'))
        .toStrictEqual({ error: expect.any(String) });
    });
    test('Check for valid quiz name length', () => {
      const userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      expect(adminQuizCreate(userId.token, 'A very long quiz name which is far too long', 'Quiz Description'))
        .toStrictEqual({ error: expect.any(String) });
    });
    test('Check for duplicate quiz name', () => {
      const userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      adminQuizCreate(userId.token, 'Duplicate Quiz Name', 'Quiz Description');
      expect(adminQuizCreate(userId.token, 'Duplicate Quiz Name', 'Quiz Description'))
        .toStrictEqual({ error: expect.any(String) });
    });
    test('Check for valid quiz description length', () => {
      const userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      expect(adminQuizCreate(userId.token, 'Quiz Name', 'A very, very, very, very, very, extraordinarily, tremendously, stupendously, ridiculously, anomolously, long description'))
        .toStrictEqual({ error: expect.any(String) });
    });
  });
});
