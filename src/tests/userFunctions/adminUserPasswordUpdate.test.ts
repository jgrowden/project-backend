import { requestAuthRegister, requestAuthLogin, requestAuthLoginV2, requestUserPasswordUpdate, requestUserPasswordUpdateV2, clear, errorCode } from '../wrapper';
import HTTPError from 'http-errors';

let token: string;
beforeEach(() => {
  clear();
  const { jsonBody } = requestAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
  token = jsonBody.token as string;
});

describe('requestUserPasswordUpdateV1 test cases', () => {
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

describe('requestUserPasswordUpdateV2 test cases', () => {
  test('Successful cases', () => {
    requestUserPasswordUpdateV2(token, 'p@ssw0rd', 'valid_p@ssw0rd');
    expect(requestAuthLoginV2('email@gmail.com', 'p@ssw0rd'))
    .toThrow(HTTPError[400]);
    expect(requestAuthLoginV2('email@gmail.com', 'valid_p@ssw0rd')).toStrictEqual({
      statusCode: 200,
      jsonBody: { token: expect.any(String) }
    });
  });
  test('Check for invalid token', () => {
    expect(() => requestUserPasswordUpdateV2(token + 'a', 'p@ssw0rd', 'new_p@ssw0rd'))
    .toThrow(HTTPError[401]);
  });
  test('Check for when old password is not the correct old password', () => {
    expect(() => requestUserPasswordUpdateV2(token, 'wrong_p@ssw0rd', 'new_p@ssword'))
    .toThrow(HTTPError[400]);
  });
  test('Check for when new password matches the old password exactly', () => {
    expect(() => requestUserPasswordUpdateV2(token, 'p@ssw0rd', 'p@ssw0rd'))
    .toThrow(HTTPError[400]);
  });
  test('Check for when new password has already been used by this token', () => {
    requestUserPasswordUpdateV2(token, 'p@ssw0rd', 'new_p@ssw0rd');
    expect(() => requestUserPasswordUpdateV2(token, 'new_p@ssw0rd', 'p@ssw0rd'))
    .toThrow(HTTPError[400]);
  });
  test('Check for when new password is less than 8 characters', () => {
    expect(() => requestUserPasswordUpdateV2(token, 'p@ssw0rd', 'p@ssw0r'))
    .toThrow(HTTPError[400]);
  });
  test('Check for when new password does not contain at least one number', () => {
    expect(() => requestUserPasswordUpdateV2(token, 'p@ssw0rd', 'p@ssword'))
    .toThrow(HTTPError[400]);
  });
  test('Check for when new password does not contain at least one letter', () => {
    expect(() => requestUserPasswordUpdateV2(token, 'p@ssw0rd', '12345678'))
    .toThrow(HTTPError[400]);
  });
});
