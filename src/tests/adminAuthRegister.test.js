import { clear } from '../other';
import { adminAuthRegister } from '../auth';

beforeEach(() => {
  clear();
});
describe('Testing adminAuthRegister', () => {
  test('Test successful registration', () => {
    const authUserId1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    expect(authUserId1.authUserId).toStrictEqual(expect.any(Number));
    const authUserId2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    expect(authUserId2.authUserId).toStrictEqual(expect.any(Number));
  });

  test('Check for duplicate email', () => {
    adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    expect(adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp'))
      .toMatchObject({ error: expect.any(String) });
  });

  test('Check for valid email', () => {
    expect(adminAuthRegister('notanEmail', 'P4ssword', 'No', 'Email'))
      .toMatchObject({ error: expect.any(String) });
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
      expect(adminAuthRegister(email, password, nameFirst, nameLast))
        .toStrictEqual({ error: expect.any(String) });
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
      expect(adminAuthRegister(email, password, nameFirst, nameLast))
        .toStrictEqual({ error: expect.any(String) });
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
  ])('testing for invalid password, variation $#, with password: \'$nameLast\'',
    ({ email, password, nameFirst, nameLast }) => {
      expect(adminAuthRegister(email, password, nameFirst, nameLast))
        .toStrictEqual({ error: expect.any(String) });
    }
  );
});
