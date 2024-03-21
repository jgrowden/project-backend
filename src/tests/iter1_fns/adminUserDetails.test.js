import { clear } from '../../other';
import { adminAuthRegister, adminUserDetails } from '../../auth';

beforeEach(() => {
  clear();
});

describe('adminUserDetails testing', () => {
  test('empty database', () => {
    expect(adminUserDetails(123456789)).toStrictEqual({ error: expect.any(String) });
  });
  test('no token provided', () => {
    expect(adminUserDetails()).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid user id provided', () => {
    expect(adminUserDetails('Nan')).toStrictEqual({ error: expect.any(String) });
  });
  test('token does not exist', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    expect(adminUserDetails(user1.token + '1')).toStrictEqual({ error: expect.any(String) });
  });
  test('valid token 1', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    expect(adminUserDetails(user1.token)).toMatchObject({
      user: {
        userId: expect.any(Number),
        name: 'God Usopp',
        email: 'go.d.usopp@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
  test('valid token 2', () => {
    adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    expect(adminUserDetails(user2.token)).toMatchObject({
      user: {
        userId: expect.any(Number),
        name: 'Donquixote Doflamingo',
        email: 'doffy@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});
