import { clear } from '../other';
import { adminAuthRegister, adminAuthLogin } from '../auth';

beforeEach(() => {
  clear();
});
describe('Testing adminAuthLogin', () => {
  let user;
  beforeEach(() => {
    user = adminAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
  });
  test('Test successful login', () => {
    expect(adminAuthLogin('gon.freecs@gmail.com', 'GonF1shing'))
      .toStrictEqual({ authUserId: user.authUserId });
  });

  test('Test unsuccessful login with non-existent email', () => {
    expect(adminAuthLogin('killua@gmail.com', 'k1loWatt'))
      .toStrictEqual({ error: expect.any(String) });
  });

  test('Test unsuccessful login with valid email, incorrect password', () => {
    expect(adminAuthLogin('gon.freecs@gmail.com', 'F1rstComesR0ck!'))
      .toStrictEqual({ error: expect.any(String) });
  });
});
