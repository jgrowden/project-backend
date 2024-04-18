import { requestAuthRegister, requestClear, errorCode } from '../wrapper';

beforeEach(() => {
  requestClear();
});

describe('Testing authRegister', () => {
  test('Test successful registration', () => {
    expect(requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp')).toStrictEqual({
      statusCode: 200,
      jsonBody: { token: expect.any(String) }
    });
    expect(requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo')).toStrictEqual({
      statusCode: 200,
      jsonBody: { token: expect.any(String) }
    });
  });

  test('Check for duplicate email', () => {
    requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    expect(requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp'))
      .toStrictEqual(errorCode(400));
  });

  test('Check for valid email', () => {
    expect(requestAuthRegister('notanEmail', 'P4ssword', 'No', 'Email'))
      .toStrictEqual(errorCode(400));
  });

  test.each([
    'Tony 1000',
    'D',
    'DDDDDDDDDDDDDDDDDDDDDDDD'
  ])('testing for invalid nameFirst, variation %#, with nameFirst: \'%s\'',
    (nameFirst) => {
      expect(requestAuthRegister('nico.robin@gmail.com', '0hara_demon', nameFirst, 'Robin'))
        .toStrictEqual(errorCode(400));
    }
  );

  test.each([
    'R0bin',
    'K',
    'Flammmmmmmmmmmmmmmmmmm'
  ])('testing for invalid nameLast, variation %#, with nameLast: \'%s\'',
    (nameLast) => {
      expect(requestAuthRegister('nico.robin@gmail.com', '0hara_demon', 'Nico', nameLast))
        .toStrictEqual(errorCode(400));
    }
  );

  test.each([
    'ohara_demon',
    '123456789',
    '!@#$%^&*()',
    '0hara'
  ])('testing for invalid password, variation %#, with password: \'%s\'',
    (password) => {
      expect(requestAuthRegister('nico.robin@gmail.com', password, 'Nico', 'Robin'))
        .toStrictEqual(errorCode(400));
    }
  );
});
