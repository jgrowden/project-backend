import request from 'sync-request-curl';
import { port, url } from '.../config.json';

const SERVER_URL = `${url}:${port}`;

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) => {
  const res = request(
    'POST',
    SERVER_URL + '/v1/admin/auth/register',
    {
      json: {
        email,
        password,
        nameFirst,
        nameLast
      }
    }
  );
  return JSON.parse(res.body.toString());
};

const ERROR = { error: expect.any(String) };
beforeEach(() => {
  request('DELETE', SERVER_URL + '/v1/clear', { json: {} });
});
describe('Testing authRegister', () => {
  test('Test successful registration', () => {
    const authUserId1 = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    expect(authUserId1).toStrictEqual({ sessionId: expect.any(Number) });
    const authUserId2 = requestAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    expect(authUserId2).toStrictEqual({ sessionId: expect.any(Number) });
  });

  test('Check for duplicate email', () => {
    requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    expect(requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp'))
      .toMatchObject(ERROR);
  });

  test('Check for valid email', () => {
    expect(requestAuthRegister('notanEmail', 'P4ssword', 'No', 'Email'))
      .toMatchObject(ERROR);
  });

  test.each([
    {
      email: 'tonytony.chopper@gmail.com',
      password: 'racoon_dog1',
      nameFirst: 'Tony 1000',
      nameLast: 'Chopper'
    },
    {
      email: 'monkey.d.luffy@gmail.com',
      password: 'gomugomu5',
      nameFirst: 'D',
      nameLast: 'Monkey'
    },
    {
      email: 'monkey.d.luffy@gmail.com',
      password: 'gomugomu5',
      nameFirst: 'DDDDDDDDDDDDDDDDDDDDDDDD',
      nameLast: 'Monkey'
    },
  ])('testing for invalid nameFirst, variation $#, with nameFirst: \'$nameFirst\'',
    ({ email, password, nameFirst, nameLast }) => {
      expect(requestAuthRegister(email, password, nameFirst, nameLast))
        .toStrictEqual(ERROR);
    }
  );

  test.each([
    {
      email: 'nico.robin@gmail.com',
      password: '0hara_demon',
      nameFirst: 'Nico',
      nameLast: 'R0bin'
    },
    {
      email: 'brook@gmail.com',
      password: 'S0ul_King',
      nameFirst: 'Soul',
      nameLast: 'K'
    },
    {
      email: 'franky@gmail.com',
      password: 'Thous4nd_sunny',
      nameFirst: 'Cutty',
      nameLast: 'Flammmmmmmmmmmmmmmmmmm'
    },
  ])('testing for invalid nameLast, variation $#, with nameLast: \'$nameLast\'',
    ({ email, password, nameFirst, nameLast }) => {
      expect(requestAuthRegister(email, password, nameFirst, nameLast))
        .toStrictEqual(ERROR);
    }
  );

  test.each([
    {
      email: 'nico.robin@gmail.com',
      password: 'ohara_demon',
      nameFirst: 'Nico',
      nameLast: 'Robin'
    },
    {
      email: 'brook@gmail.com',
      password: '123456789',
      nameFirst: 'Soul',
      nameLast: 'K'
    },
    {
      email: 'franky@gmail.com',
      password: '!@#$%^&*()',
      nameFirst: 'Cutty',
      nameLast: 'Flammmmmmmmmmmmmmmmmmm'
    },
    {
      email: 'nico.robin@gmail.com',
      password: '0hara',
      nameFirst: 'Nico',

      nameLast: 'Robin'
    }
  ])('testing for invalid password, variation $#, with password: \'$password\'',
    ({ email, password, nameFirst, nameLast }) => {
      expect(requestAuthRegister(email, password, nameFirst, nameLast))
        .toStrictEqual(ERROR);
    }
  );
});
