import { clear } from '../other.js';
import { adminAuthRegister, adminUserDetails } from '../auth.js';

beforeEach(() => {
  clear();
});

describe('adminUserDetails testing', () => {
  test('empty database', () => {
    expect(adminUserDetails(123456789)).toStrictEqual({ error: expect.any(String) });
  });
  test('no authUserId provided', () => {
    expect(adminUserDetails()).toStrictEqual({ error: expect.any(String) });
  });
  test('invalid user id provided', () => {
    expect(adminUserDetails('Nan')).toStrictEqual({ error: expect.any(String) });
  });
  test('authUserId does not exist', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    expect(adminUserDetails(user1.authUserId + 1)).toStrictEqual({ error: expect.any(String) });
  });
  test('valid authUserId 1', () => {
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    expect(adminUserDetails(user1.authUserId)).toMatchObject({
      user: {
        userId: user1.authUserId,
        name: 'God Usopp',
        email: 'go.d.usopp@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
  test('valid authUserId 2', () => {
    adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    expect(adminUserDetails(user2.authUserId)).toMatchObject({
      user: {
        userId: user2.authUserId,
        name: 'Donquixote Doflamingo',
        email: 'doffy@gmail.com',
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0
      }
    });
  });
});
