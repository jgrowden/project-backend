import { clear } from '../other.js';
import { adminAuthRegister, adminUserDetails } from '../auth.js';

describe('adminUserDetails testing', () => {
    test('empty database', () => {
        clear();
        expect(adminUserDetails(123456789)).toHaveProperty("error");
    });
    test('no authUserId provided', () => {
        clear();
        expect(adminUserDetails()).toHaveProperty("error");
    });
    test('authUserId does not exist', () => {
        clear();
        const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        const user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
        expect(adminUserDetails(3)).toHaveProperty("error");
    });
    test('valid authUserId 1', () => {
        clear();
        const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        const user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
        expect(adminUserDetails(1)).toMatchObject({user: {userId: 1, name: 'God Usopp', email: "go.d.usopp@gmail.com", 
                                                    numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0}});
    });
    test('valid authUserId 2', () => {
        clear();
        const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        const user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
        expect(adminUserDetails(2)).toMatchObject({user: {userId: 2, name: "Donquixote Doflamingo", email: "doffy@gmail.com", 
                                                    numSuccessfulLogins: 1, numFailedPasswordsSinceLastLogin: 0}});
    });
});