import { clear, errorCode, requestUserDetails, requestUserDetailsUpdate, requestUserDetailsUpdateV2 } from '../wrapper';
import { requestAuthRegister } from '../wrapper';
import HTTPError from 'http-errors';

describe('adminUserDetailsUpdate http testing', () => {
  let user1Token: string;
  let user2Token: string;

  beforeEach(() => {
    clear();
    user1Token = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
    user2Token = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo').jsonBody.token as string;
  });

  test('invalid ID', () => {
    clear();
    user1Token = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
    expect(requestUserDetailsUpdate(user1Token + 1, 'test@email.com', 'John', 'Smith')).toStrictEqual(errorCode(401));
  });

  test('email used by another user', () => {
    expect(requestUserDetailsUpdate(user2Token, 'go.d.usopp@gmail.com', 'John', 'Smith')).toStrictEqual(errorCode(400));
  });

  test('email does not satisfy validator', () => {
    expect(requestUserDetailsUpdate(user2Token, 'not_an_email', 'John', 'Smith')).toStrictEqual(errorCode(400));
  });

  test('invalid characters in nameFirst 1', () => {
    expect(requestUserDetailsUpdate(user2Token, 'test@email.com', 'Jo!hn', 'Smith')).toStrictEqual(errorCode(400));
  });

  test('invalid characters in nameFirst 2', () => {
    expect(requestUserDetailsUpdate(user2Token, 'test@email.com', 'J0hn', 'Smith')).toStrictEqual(errorCode(400));
  });

  test('nameFirst less than 2 characters long', () => {
    expect(requestUserDetailsUpdate(user2Token, 'test@email.com', 'J', 'Smith')).toStrictEqual(errorCode(400));
  });

  test('nameFirst more than 20 characters long', () => {
    expect(requestUserDetailsUpdate(user2Token, 'test@email.com', 'Abcdefghijklmnopqrstuvwxyz', 'Smith')).toStrictEqual(errorCode(400));
  });

  test('invalid characters in nameLast 1', () => {
    expect(requestUserDetailsUpdate(user2Token, 'test@email.com', 'John', 'Sm1th')).toStrictEqual(errorCode(400));
  });

  test('invalid characters in nameLast 2', () => {
    expect(requestUserDetailsUpdate(user2Token, 'test@email.com', 'John', 'Sm@th')).toStrictEqual(errorCode(400));
  });

  test('nameLast less than 2 characters', () => {
    expect(requestUserDetailsUpdate(user2Token, 'test@email.com', 'John', 'S')).toStrictEqual(errorCode(400));
  });

  test('nameLast more than 20 characters', () => {
    expect(requestUserDetailsUpdate(user2Token, 'test@email.com', 'John', 'Abcdefghijklmnopqrstuvwxyz')).toStrictEqual(errorCode(400));
  });

  // tests ensure that data has actually been written to the database
  test('no errors 1', () => {
    expect(requestUserDetailsUpdate(user2Token, 'test@email.com', 'John', 'Smith'))
      .toStrictEqual({
        statusCode: 200,
        jsonBody: {}
      });
    expect(requestUserDetails(user2Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'John Smith',
            email: 'test@email.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          },
        }
      }
    );
  });

  test('no errors 2', () => {
    expect(requestUserDetailsUpdate(user1Token, 'test2@email.com', 'Johnny', 'Smitho'))
      .toStrictEqual({
        statusCode: 200,
        jsonBody: {}
      });
    expect(requestUserDetails(user1Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'Johnny Smitho',
            email: 'test2@email.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          },
        }
      }
    );
  });

  test('no errors 3, 20 character names', () => {
    expect(requestUserDetailsUpdate(user1Token, 'test3@email.com', 'abcdefghijklmnopqrst', 'tsrqponmlkjihgfedcab'))
      .toStrictEqual({
        statusCode: 200,
        jsonBody: {}
      });
    expect(requestUserDetails(user1Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'abcdefghijklmnopqrst tsrqponmlkjihgfedcab',
            email: 'test3@email.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          },
        }
      }
    );
  });

  test('no errors 4, 2 character names', () => {
    expect(requestUserDetailsUpdate(user1Token, 'test4@email.com', 'ab', 'ba'))
      .toStrictEqual({
        statusCode: 200,
        jsonBody: {}
      });
    expect(requestUserDetails(user1Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'ab ba',
            email: 'test4@email.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          },
        }
      }
    );
  });

  test('no errors 5, only update names', () => {
    expect(requestUserDetailsUpdate(user1Token, 'go.d.usopp@gmail.com', 'ab', 'ba'))
      .toStrictEqual({
        statusCode: 200,
        jsonBody: {}
      });
    expect(requestUserDetails(user1Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'ab ba',
            email: 'go.d.usopp@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          },
        }
      }
    );
  });
});

describe('adminUserDetailsUpdate v2 http testing', () => {
  let user1Token: string;
  let user2Token: string;

  beforeEach(() => {
    clear();
    user1Token = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
    user2Token = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo').jsonBody.token as string;
  });

  test('invalid ID', () => {
    clear();
    user1Token = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
    expect(() => requestUserDetailsUpdateV2(user1Token + 1, 'test@email.com', 'John', 'Smith')).toThrow(HTTPError[401]);
  });

  test('email used by another user', () => {
    expect(() => requestUserDetailsUpdateV2(user2Token, 'go.d.usopp@gmail.com', 'John', 'Smith')).toThrow(HTTPError[400]);
  });

  test('email does not satisfy validator', () => {
    expect(() => requestUserDetailsUpdateV2(user2Token, 'not_an_email', 'John', 'Smith')).toThrow(HTTPError[400]);
  });

  test('invalid characters in nameFirst 1', () => {
    expect(() => requestUserDetailsUpdateV2(user2Token, 'test@email.com', 'Jo!hn', 'Smith')).toThrow(HTTPError[400]);
  });

  test('invalid characters in nameFirst 2', () => {
    expect(() => requestUserDetailsUpdateV2(user2Token, 'test@email.com', 'J0hn', 'Smith')).toThrow(HTTPError[400]);
  });

  test('nameFirst less than 2 characters long', () => {
    expect(() => requestUserDetailsUpdateV2(user2Token, 'test@email.com', 'J', 'Smith')).toThrow(HTTPError[400]);
  });

  test('nameFirst more than 20 characters long', () => {
    expect(() => requestUserDetailsUpdateV2(user2Token, 'test@email.com', 'Abcdefghijklmnopqrstuvwxyz', 'Smith')).toThrow(HTTPError[400]);
  });

  test('invalid characters in nameLast 1', () => {
    expect(() => requestUserDetailsUpdateV2(user2Token, 'test@email.com', 'John', 'Sm1th')).toThrow(HTTPError[400]);
  });

  test('invalid characters in nameLast 2', () => {
    expect(() => requestUserDetailsUpdateV2(user2Token, 'test@email.com', 'John', 'Sm@th')).toThrow(HTTPError[400]);
  });

  test('nameLast less than 2 characters', () => {
    expect(() => requestUserDetailsUpdateV2(user2Token, 'test@email.com', 'John', 'S')).toThrow(HTTPError[400]);
  });

  test('nameLast more than 20 characters', () => {
    expect(() => requestUserDetailsUpdateV2(user2Token, 'test@email.com', 'John', 'Abcdefghijklmnopqrstuvwxyz')).toThrow(HTTPError[400]);
  });

  // tests ensure that data has actually been written to the database
  test('no errors 1', () => {
    expect(requestUserDetailsUpdateV2(user2Token, 'test@email.com', 'John', 'Smith'))
      .toStrictEqual({
        statusCode: 200,
        jsonBody: {}
      });
    expect(requestUserDetails(user2Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'John Smith',
            email: 'test@email.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          },
        }
      }
    );
  });

  test('no errors 2', () => {
    expect(requestUserDetailsUpdateV2(user1Token, 'test2@email.com', 'Johnny', 'Smitho'))
      .toStrictEqual({
        statusCode: 200,
        jsonBody: {}
      });
    expect(requestUserDetails(user1Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'Johnny Smitho',
            email: 'test2@email.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          },
        }
      }
    );
  });

  test('no errors 3, 20 character names', () => {
    expect(requestUserDetailsUpdateV2(user1Token, 'test3@email.com', 'abcdefghijklmnopqrst', 'tsrqponmlkjihgfedcab'))
      .toStrictEqual({
        statusCode: 200,
        jsonBody: {}
      });
    expect(requestUserDetails(user1Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'abcdefghijklmnopqrst tsrqponmlkjihgfedcab',
            email: 'test3@email.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          },
        }
      }
    );
  });

  test('no errors 4, 2 character names', () => {
    expect(requestUserDetailsUpdateV2(user1Token, 'test4@email.com', 'ab', 'ba'))
      .toStrictEqual({
        statusCode: 200,
        jsonBody: {}
      });
    expect(requestUserDetails(user1Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'ab ba',
            email: 'test4@email.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          },
        }
      }
    );
  });

  test('no errors 5, only update names', () => {
    expect(requestUserDetailsUpdateV2(user1Token, 'go.d.usopp@gmail.com', 'ab', 'ba'))
      .toStrictEqual({
        statusCode: 200,
        jsonBody: {}
      });
    expect(requestUserDetails(user1Token)).toStrictEqual(
      {
        statusCode: 200,
        jsonBody: {
          user: {
            userId: expect.any(Number),
            name: 'ab ba',
            email: 'go.d.usopp@gmail.com',
            numSuccessfulLogins: 1,
            numFailedPasswordsSinceLastLogin: 0
          },
        }
      }
    );
  });
});
