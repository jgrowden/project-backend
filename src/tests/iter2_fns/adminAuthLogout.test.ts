import { clear, errorCode, requestAuthLogin, requestAuthLogout, requestAuthRegister } from '../wrapper';

let token1: string;
let token2: string;

beforeEach(() => {
  clear();
  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').jsonBody.token;
});

describe('adminAuthLogout tests for POST /v1/admin/auth/logout', () => {
  test('invalid token', () => {
    expect(requestAuthLogout(token1 + '1')).toStrictEqual(errorCode(401));
  });

  test('succesful logout', () => {
    expect(requestAuthLogout(token1)).toStrictEqual({ statusCode: 200, jsonBody: {} });
    expect(requestAuthLogout(token1)).toStrictEqual(errorCode(401));
  });

  test('logout, followed by another login and logout', () => {
    expect(requestAuthLogout(token1)).toStrictEqual({ statusCode: 200, jsonBody: {} });
    expect(requestAuthLogout(token1)).toStrictEqual(errorCode(401));
    token2 = requestAuthLogin('hayden.smith@unsw.edu.au', 'haydensmith123').jsonBody.token;
    expect(requestAuthLogout(token2)).toStrictEqual({ statusCode: 200, jsonBody: {} });
    expect(requestAuthLogout(token2)).toStrictEqual(errorCode(401));
    
  })
});
