import { requestAuthRegister, requestAuthLogin, requestUserDetails, requestUserPasswordUpdate, clear, errorCode } from '../wrapper';
let user: string;

beforeEach(() => {
  clear();
  const { jsonBody } = requestAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
  user = jsonBody.token as string;
});

describe('requestUserPasswordUpdate test cases', () => {
  test('Successful cases', () => {
    requestUserPasswordUpdate(user, 'p@ssw0rd', 'valid_p@ssw0rd');
    expect(requestAuthLogin('email@gmail.com', 'p@ssw0rd'))
      .toStrictEqual(errorCode(400));
    expect(requestAuthLogin('email@gmail.com', 'valid_p@ssw0rd')).toStrictEqual({
      statusCode: 200,
      jsonBody: { token: expect.any(String) }
    });
  });
  test('Check for invalid token', () => {
    expect(requestUserPasswordUpdate(user + 'a', 'p@ssw0rd', 'new_p@ssw0rd'))
      .toStrictEqual(errorCode(401));
  });
  test('Check for when old password is not the correct old password', () => {
    expect(requestUserPasswordUpdate(user, 'wrong_p@ssw0rd', 'new_p@ssword'))
      .toStrictEqual(errorCode(400));
  });
  test('Check for when new password matches the old password exactly', () => {
    expect(requestUserPasswordUpdate(user, 'p@ssw0rd', 'p@ssw0rd'))
      .toStrictEqual(errorCode(400));
  });
  test('Check for when new password has already been used by this user', () => {
    requestUserPasswordUpdate(user, 'p@ssw0rd', 'new_p@ssw0rd');
    expect(requestUserPasswordUpdate(user, 'new_p@ssw0rd', 'p@ssw0rd'))
      .toStrictEqual(errorCode(400));
  });
  test('Check for when new password is less than 8 characters', () => {
    expect(requestUserPasswordUpdate(user, 'p@ssw0rd', 'p@ssw0r'))
      .toStrictEqual(errorCode(400));
  });
  test('Check for when new password does not contain at least one number', () => {
    expect(requestUserPasswordUpdate(user, 'p@ssw0rd', 'p@ssword'))
      .toStrictEqual(errorCode(400));
  });
  test('Check for when new password does not contain at least one letter', () => {
    expect(requestUserPasswordUpdate(user, 'p@ssw0rd', '12345678'))
      .toStrictEqual(errorCode(400));
  });
});
