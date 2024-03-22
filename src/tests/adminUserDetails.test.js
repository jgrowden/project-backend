import { clear, requestUserDetails, requestAuthRegister, ERROR } from './wrapper';

beforeEach(() => {
  clear();
});

describe('adminUserDetails testing', () => {
  test('empty database', () => {
    expect(requestUserDetails(123456789)).toStrictEqual(
      {
        statusCode: 400,
        jsonBody: ERROR
      });
  });
  test('no token provided', () => {
    expect(requestUserDetails(123456789)).toStrictEqual(
      {
        statusCode: 400,
        jsonBody: ERROR
      });
  });
  test('token does not exist', () => {
    const user1Token = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token;
    expect(requestUserDetails(user1Token + '1')).toStrictEqual(
      {
        statusCode: 400,
        jsonBody: ERROR
      });
  });
  test('valid token 1', () => {
    const user1Token = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token;
    requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    expect(requestUserDetails(user1Token)).toMatchObject(
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
    const user2Token = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo').jsonBody.token;
    expect(requestUserDetails(user2Token)).toMatchObject(
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
