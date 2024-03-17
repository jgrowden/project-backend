import { adminQuizCreate, adminQuizNameUpdate, adminQuizInfo } from '../quiz';
import { clear } from '../other';
import { adminAuthRegister } from '../auth';

clear();
beforeEach(() => {
  clear();
});

describe('adminQuizNameUpdate', () => {
  test('invalid user ID', () => {
    expect(adminQuizNameUpdate('user ID', 1, 'great quiz'))
      .toStrictEqual({ error: expect.any(String) });
  });

  test('user ID not found', () => {
    clear();
    expect(adminQuizNameUpdate(1, 1, 'great quiz'))
      .toStrictEqual({ error: expect.any(String) });
  });

  test('invalid quiz ID', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
    expect(adminQuizNameUpdate(user1.authUserId, 'quizId', 'great quiz'))
      .toStrictEqual({ error: expect.any(String) });
  });

  test('quiz ID not found', () => {
    clear();
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    expect(adminQuizNameUpdate(user1.authUserId, 1, 'great quiz'))
      .toStrictEqual({ error: expect.any(String) });
  });

  test('quiz not owned by user', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
    const user2 = adminAuthRegister('fancypants@gmail.com', 'f4ncyP4nts', 'Fancy', 'Pants');
    expect(adminQuizNameUpdate(user2.authUserId, quiz1.quizId, 'great quiz'))
      .toStrictEqual({ error: expect.any(String) });
  });

  test('invalid characters in quiz name', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
    expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, '/!greatQUIZ>>'))
      .toStrictEqual({ error: expect.any(String) });
  });

  test('quiz name less than 3 characters long', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
    expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'ab'))
      .toStrictEqual({ error: expect.any(String) });
  });

  test('quiz name more than 30 characters long', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
    expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'abcedfghijklmnopqrstuvwxyz123456789'))
      .toStrictEqual({ error: expect.any(String) });
  });

  test('quiz name already used on another quiz by logged in user', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
    adminQuizCreate(user1.authUserId, 'great quiz', 'is good');
    expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'great quiz'))
      .toStrictEqual({ error: expect.any(String) });
  });

  test('no errors 1', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
    expect(JSON.stringify(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'great quiz'))).toBe('{}');
    expect(adminQuizInfo(user1.authUserId, quiz1.quizId)).toMatchObject({
      quizId: quiz1.quizId,
      name: 'great quiz',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'is good',
    });
  });

  test('no errors 2, 3 character names', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
    expect(JSON.stringify(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'Abc'))).toBe('{}');
    expect(adminQuizInfo(user1.authUserId, quiz1.quizId)).toMatchObject({
      quizId: quiz1.quizId,
      name: 'Abc',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'is good',
    });
  });

  test('no errors 3, 30 character names', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
    expect(JSON.stringify(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'ABCdefghijklmnopqrstuvwxyz1234'))).toBe('{}');
    expect(adminQuizInfo(user1.authUserId, quiz1.quizId)).toMatchObject({
      quizId: quiz1.quizId,
      name: 'ABCdefghijklmnopqrstuvwxyz1234',
      timeCreated: expect.any(Number),
      timeLastEdited: expect.any(Number),
      description: 'is good',
    });
  });
});
