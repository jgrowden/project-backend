import { requestAuthRegister, requestAuthLogin, requestClear, errorCode } from '../wrapper';

beforeEach(() => {
  requestClear();
});

describe('Testing adminAuthLogin', () => {
  beforeEach(() => {
    requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
  });
  test('Test successful login', () => {
    expect(requestAuthLogin('gon.freecs@gmail.com', 'GonF1shing')).toStrictEqual({
      statusCode: 200,
      jsonBody: { token: expect.any(String) }
    });
  });

  test('Test unsuccessful login with non-existent email', () => {
    expect(requestAuthLogin('killua@gmail.com', 'k1loWatt'))
      .toStrictEqual(errorCode(400));
  });

  test('Test unsuccessful login with valid email, incorrect password', () => {
    expect(requestAuthLogin('gon.freecs@gmail.com', 'F1rstComesR0ck!'))
      .toStrictEqual(errorCode(400));
  });
});
