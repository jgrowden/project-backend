import request from 'sync-request-curl';
import { port, url } from '.../config.json';

const SERVER_URL = `${url}:${port}`;
const requestAuthLogin = (email: string, password: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/login',
    {
      json: {
        email,
        password,
      }
    }
  );
  return JSON.parse(res.body.toString());
};

const ERROR = { error: expect.any(String) };
beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { json: {} });
});

describe('Testing adminAuthLogin', () => {
  let user;
  beforeEach(() => {
    user = adminAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
  });
  test('Test successful login', () => {
    expect(requestAuthLogin('gon.freecs@gmail.com', 'GonF1shing'))
      .toStrictEqual({ authUserId: user.authUserId });
  });

  test('Test unsuccessful login with non-existent email', () => {
    expect(requestAuthLogin('killua@gmail.com', 'k1loWatt'))
      .toStrictEqual(ERROR);
  });

  test('Test unsuccessful login with valid email, incorrect password', () => {
    expect(requestAuthLogin('gon.freecs@gmail.com', 'F1rstComesR0ck!'))
      .toStrictEqual(ERROR);
  });
});
