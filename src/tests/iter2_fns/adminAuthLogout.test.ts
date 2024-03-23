import { clear, errorCode, requestAuthLogout, requestAuthRegister } from '../wrapper';

let token1: string;

beforeEach(() => {
  clear();
  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').jsonBody.token;
});

describe('adminAuthLogout tests for POST /v1/admin/auth/logout', () => {
  // invalid token
  test('invalid token', () => {
    expect(requestAuthLogout(token1 + '1')).toStrictEqual(errorCode(401));
  });
  // successful logout. can test by attempting to logout again, which should fail
  test('succesful logout', () => {
    expect(requestAuthLogout(token1)).toStrictEqual({ statusCode: 200, jsonBody: {} });
    expect(requestAuthLogout(token1)).toStrictEqual(errorCode(401));
  });
});