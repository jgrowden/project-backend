import { clear } from '../other.js';
import { adminAuthRegister, adminUserDetails } from '../auth.js';


clear();

describe('adminUserDetails testing', () => {
    test('empty database', () => {
        expect(adminUserDetails(123456789)).toHaveProperty(error);
    });
    test('no authUserId provided', () => {
        expect(adminUserDetails()).toHaveProperty(error);
    });
    test('authUserId does not exist', () => {
        const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        const user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
        expect(adminUserDetails(3)).toHaveProperty(error);
    });
    test('valid authUserId 1', () => {
        expect(adminUserDetails(1)).toMatchObject({user: {userId: 1, name: 'God Usopp', email: "go.d.usopp@gmail.com", 
                                                    numSuccessfulLogins: 0, numFailedPasswordsSinceLastLogin: 0}});
    });
    test('valid authUserId 2', () => {
        expect(adminUserDetails(2)).toMatchObject({user: {userId: 2, name: "Donquixote Doflamingo", email: "doffy@gmail.com", 
                                                    numSuccessfulLogins: 0, numFailedPasswordsSinceLastLogin: 0}});
    });
});