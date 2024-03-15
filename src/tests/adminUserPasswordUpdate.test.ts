import { clear } from '../other';
import { adminUserPasswordUpdate, adminAuthRegister, adminAuthLogin } from '../auth';

interface userID {
    authUserId: number;
  }

describe('adminUserPasswordUpdate', () => {
  let userId: userID;
  beforeEach(() => {
    clear();
    userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
  });
  test('Check for invalid authUserId', () => {
    clear();
    expect(adminUserPasswordUpdate(1, 'p@ssw0rd', 'new_p@ssw0rd'))
      .toMatchObject({ error: expect.any(String) });
  });
  test('Check for when old password is not the correct old password', () => {
    expect(adminUserPasswordUpdate(userId.authUserId, 'wrong_p@ssw0rd', 'new_p@ssword'))
      .toMatchObject({ error: expect.any(String) });
  });
  test('Check for when new password matches the old password exactly', () => {
    expect(adminUserPasswordUpdate(userId.authUserId, 'p@ssw0rd', 'p@ssw0rd'))
      .toMatchObject({ error: expect.any(String) });
  });
  test('Check for when new password has already been used by this user', () => {
    adminUserPasswordUpdate(userId.authUserId, 'p@ssw0rd', 'new_p@ssw0rd');
    expect(adminUserPasswordUpdate(userId.authUserId, 'new_p@ssw0rd', 'p@ssw0rd'))
      .toMatchObject({ error: expect.any(String) });
  });
  test('Check for when new password is less than 8 characters', () => {
    expect(adminUserPasswordUpdate(userId.authUserId, 'p@ssw0rd', 'p@ssw0r'))
      .toMatchObject({ error: expect.any(String) });
  });
  test('Check for when new password does not contain at least one number', () => {
    expect(adminUserPasswordUpdate(userId.authUserId, 'p@ssw0rd', 'p@ssword'))
      .toMatchObject({ error: expect.any(String) });
  });
  test('Check for when new password does not contain at least one letter', () => {
    expect(adminUserPasswordUpdate(userId.authUserId, 'p@ssw0rd', '12345678'))
      .toMatchObject({ error: expect.any(String) });
  });
  test('No errors', () => {
    adminUserPasswordUpdate(userId.authUserId, 'p@ssw0rd', 'valid_p@ssw0rd');
    expect(adminAuthLogin('email@gmail.com', 'p@ssw0rd'))
      .toMatchObject({ error: expect.any(String) });
    expect(adminAuthLogin('email@gmail.com', 'valid_p@ssw0rd'))
      .toMatchObject({ authUserId: userId.authUserId });
  });
});
