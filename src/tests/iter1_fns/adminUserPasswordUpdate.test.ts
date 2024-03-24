import { requestAuthRegister, requestAuthLogin, requestUserPasswordUpdate, clear, errorCode } from '../wrapper';

let token: string;
beforeEach(() => {
  clear();
  const { jsonBody } = requestAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
  token = jsonBody.token as string;
});

describe('requestUserPasswordUpdate test cases', () => {
  test('Successful cases', () => {
    requestUserPasswordUpdate(token, 'p@ssw0rd', 'valid_p@ssw0rd');
    expect(requestAuthLogin('email@gmail.com', 'p@ssw0rd'))
      .toStrictEqual(errorCode(400));
    expect(requestAuthLogin('email@gmail.com', 'valid_p@ssw0rd')).toStrictEqual({
      statusCode: 200,
      jsonBody: { token: expect.any(String) }
    });
  });
  test('Check for invalid token', () => {
    expect(requestUserPasswordUpdate(token + 'a', 'p@ssw0rd', 'new_p@ssw0rd'))
      .toStrictEqual(errorCode(401));
  });
  test('Check for when old password is not the correct old password', () => {
    expect(requestUserPasswordUpdate(token, 'wrong_p@ssw0rd', 'new_p@ssword'))
      .toStrictEqual(errorCode(400));
  });
  test('Check for when new password matches the old password exactly', () => {
    expect(requestUserPasswordUpdate(token, 'p@ssw0rd', 'p@ssw0rd'))
      .toStrictEqual(errorCode(400));
  });
  test('Check for when new password has already been used by this token', () => {
    requestUserPasswordUpdate(token, 'p@ssw0rd', 'new_p@ssw0rd');
    expect(requestUserPasswordUpdate(token, 'new_p@ssw0rd', 'p@ssw0rd'))
      .toStrictEqual(errorCode(400));
  });
  test('Check for when new password is less than 8 characters', () => {
    expect(requestUserPasswordUpdate(token, 'p@ssw0rd', 'p@ssw0r'))
      .toStrictEqual(errorCode(400));
  });
  test('Check for when new password does not contain at least one number', () => {
    expect(requestUserPasswordUpdate(token, 'p@ssw0rd', 'p@ssword'))
      .toStrictEqual(errorCode(400));
  });
  test('Check for when new password does not contain at least one letter', () => {
    expect(requestUserPasswordUpdate(token, 'p@ssw0rd', '12345678'))
      .toStrictEqual(errorCode(400));
  });
});
