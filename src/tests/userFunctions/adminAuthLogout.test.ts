import { requestClear, errorCode, requestAuthLogin, requestAuthLogout, requestAuthLogoutV2, requestAuthRegister } from '../wrapper';
import HTTPError from 'http-errors';

let token1: string;
let token2: string;

beforeEach(() => {
  requestClear();
  token1 = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith').jsonBody.token as string;
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
    token2 = requestAuthLogin('hayden.smith@unsw.edu.au', 'haydensmith123').jsonBody.token as string;
    expect(requestAuthLogout(token2)).toStrictEqual({ statusCode: 200, jsonBody: {} });
    expect(requestAuthLogout(token2)).toStrictEqual(errorCode(401));
  });
});

describe('adminAuthLogout tests for POST /v2/admin/auth/logout', () => {
  test('invalid token', () => {
    expect(() => requestAuthLogoutV2(token1 + '1')).toThrow(HTTPError[401]);
  });

  test('succesful logout', () => {
    expect(requestAuthLogoutV2(token1)).toStrictEqual({ statusCode: 200, jsonBody: {} });
    expect(() => requestAuthLogoutV2(token1)).toThrow(HTTPError[401]);
  });

  test('logout, followed by another login and logout', () => {
    expect(requestAuthLogoutV2(token1)).toStrictEqual({ statusCode: 200, jsonBody: {} });
    expect(() => requestAuthLogoutV2(token1)).toThrow(HTTPError[401]);
    token2 = requestAuthLogin('hayden.smith@unsw.edu.au', 'haydensmith123').jsonBody.token as string;
    expect(requestAuthLogoutV2(token2)).toStrictEqual({ statusCode: 200, jsonBody: {} });
    expect(() => requestAuthLogoutV2(token2)).toThrow(HTTPError[401]);
  });
});
