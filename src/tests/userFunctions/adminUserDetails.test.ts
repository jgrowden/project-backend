import { clear, requestUserDetails, requestAuthRegister, errorCode, requestUserDetailsV2 } from '../wrapper';
import HTTPError from 'http-errors';

beforeEach(() => {
  clear();
});

describe('adminUserDetails testing', () => {
  test('empty database', () => {
    expect(requestUserDetails('123456789')).toStrictEqual(errorCode(401));
  });
  test('token does not exist', () => {
    const user1Token: string = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
    expect(requestUserDetails(user1Token + '1')).toStrictEqual(errorCode(401));
  });
  test('valid token 1', () => {
    const user1Token: string = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
    requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    expect(requestUserDetails(user1Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'God Usopp',
            email: 'go.d.usopp@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          }
        }
      }
    );
  });
  test('valid token 2', () => {
    requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const user2Token: string = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo').jsonBody.token as string;
    expect(requestUserDetails(user2Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'Donquixote Doflamingo',
            email: 'doffy@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          }
        }
      }
    );
  });
});

describe('adminUserDetailsV2 testing', () => {
  test('empty database', () => {
    expect(() => requestUserDetailsV2('123456789')).toThrow(HTTPError[401]);
  });
  test('token does not exist', () => {
    const user1Token: string = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
    expect(() => requestUserDetailsV2(user1Token + '1')).toThrow(HTTPError[401]);
  });
  test('valid token 1', () => {
    const user1Token: string = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
    requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    expect(requestUserDetailsV2(user1Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'God Usopp',
            email: 'go.d.usopp@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          }
        }
      }
    );
  });
  test('valid token 2', () => {
    requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const user2Token: string = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo').jsonBody.token as string;
    expect(requestUserDetailsV2(user2Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'Donquixote Doflamingo',
            email: 'doffy@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          }
        }
      }
    );
  });
});
