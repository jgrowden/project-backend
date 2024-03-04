import { clear } from '../other.js'
import { adminAuthRegister } from '../auth.js'

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
        const authUserId1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        expect(adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp'))
            .toMatchObject({ error: expect.any(String) });
    });
    
    test('Check for valid email', () => {
        expect(adminAuthRegister('notanEmail', 'P4ssword', 'No', 'Email'))
            .toMatchObject({ error: expect.any(String) });
    });

    test.each([
        { email: 'tonytony.chopper@gmail.com', password: 'racoon_dog1', 
            nameFirst: 'Tony 1000', nameLast: 'Chopper' },
        { email: 'monkey.d.luffy@gmail.com', password: 'gomugomu5',
            nameFirst: 'D', nameLast: 'Monkey'},
        { email: 'monkey.d.luffy@gmail.com', password: 'gomugomu5', 
            nameFirst: 'DDDDDDDDDDDDDDDDDDDDDDDD', nameLast: 'Monkey' },
    ])('testing for invalid nameFirst, variation $#, with nameFirst: \'$nameFirst\'', 
        ({email, password, nameFirst, nameLast}) => {
            expect(adminAuthRegister(email, password, nameFirst, nameLast))
                .toStrictEqual({ error: expect.any(String)} );
        })

    test('Check for invalid nameLast', () => {
        expect(adminAuthRegister('nico.robin@gmail.com', '0hara_demon', 'Nico', 'R0bin'))
            .toMatchObject({ error: expect.any(String) });

        expect(adminAuthRegister('brook@gmail.com', 'S0ul_King', 'Soul', 'K'))
            .toMatchObject({ error: expect.any(String) });

        expect(adminAuthRegister('franky@gmail.com', 'Thous4nd_sunny', 'Cutty', 'Flammmmmmmmmmmmmmmmmmm'))
            .toMatchObject({ error: expect.any(String) });
    });

    test('Check for invalid password', () => {
        expect(adminAuthRegister('nico.robin@gmail.com', 'ohara_demon', 'Nico', 'Robin'))
            .toMatchObject({ error: expect.any(String) });

        expect(adminAuthRegister('nico.robin@gmail.com', '123456789', 'Nico', 'Robin'))
            .toMatchObject({ error: expect.any(String) });
        
        expect(adminAuthRegister('nico.robin@gmail.com', '!@#$%^&*()', 'Nico', 'Robin'))
            .toMatchObject({ error: expect.any(String) });

        expect(adminAuthRegister('nico.robin@gmail.com', '0hara', 'Nico', 'Robin'))
            .toMatchObject({ error: expect.any(String) });
    });

});
/*test.each([
    { email: , password: , nameFirst: , nameLast: },
    { email: , password: , nameFirst: , nameLast: },
    { email: , password: , nameFirst: , nameLast: },
])*/