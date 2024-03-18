import { requestAuthRegister, requestAuthLogin, clear, ERROR } from './wrapper';

beforeEach(() => {
  clear();
});

describe('Testing adminAuthLogin', () => {
  beforeEach(() => {
    requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
  });
  test('Test successful login', () => {
    expect(requestAuthLogin('gon.freecs@gmail.com', 'GonF1shing')).toStrictEqual({
      statusCode: 200,
      jsonBody: { sessionId: expect.any(String) }
    });
  });

  test('Test unsuccessful login with non-existent email', () => {
    expect(requestAuthLogin('killua@gmail.com', 'k1loWatt'))
      .toStrictEqual({ statusCode: 400, jsonBody: ERROR });
  });

  test('Test unsuccessful login with valid email, incorrect password', () => {
    expect(requestAuthLogin('gon.freecs@gmail.com', 'F1rstComesR0ck!'))
      .toStrictEqual({ statusCode: 400, jsonBody: ERROR });
  });
});
