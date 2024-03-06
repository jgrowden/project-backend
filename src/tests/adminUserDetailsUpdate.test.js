import { clear } from "../other.js";
import { adminAuthRegister, adminUserDetails, adminUserDetailsUpdate } from "../auth";

describe('adminUserDetailsUpdate testing', () => {
    
    let user1;
    let user2;

    beforeEach(() => {
        clear();
        user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    });

    test('invalid ID', () => {
        expect(adminUserDetailsUpdate("invalid id", "test@email.com", "John", "Smith"))
        .toStrictEqual({ error: expect.any(String) });
    });
    
    test('ID does not exist', () => {
        clear();
        user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        expect(adminUserDetailsUpdate(user1.authUserId + 1, "test@email.com", "Amog", "Us"))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('email used by another user', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "go.d.usopp@gmail.com", "John", "Smith"))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('email does not satisfy validator', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "not_an_email", "John", "Smith"))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('invalid characters in nameFirst 1', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "Jo!hn", "Smith"))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('invalid characters in nameFirst 2', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "J0hn", "Smith"))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('nameFirst less than 2 characters long', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "J", "Smith"))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('nameFirst more than 20 characters long', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "Abcdefghijklmnopqrstuvwxyz", "Smith"))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('invalid characters in nameLast 1', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "Sm1th"))
        .toStrictEqual({ error: expect.any(String) });

    });

    test('invalid characters in nameLast 1', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "Sm@th"))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('nameLast less than 2 characters', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "S"))
        .toStrictEqual({ error: expect.any(String) });
    });

    test('nameLast more than 20 characters', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "Abcdefghijklmnopqrstuvwxyz"))
        .toStrictEqual({ error: expect.any(String) });
    });

    // tests ensure that data has actually been written to the database
    test('no errors 1', () => {
        expect(JSON.stringify(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "Smith"))).toBe('{}');
        expect(adminUserDetails(user2.authUserId)).toMatchObject(
            { user:
                {
                    userId: user2.authUserId,
                    name: "John Smith",
                    email: "test@email.com",
                    numSuccessfulLogins: 1,
                    numFailedPasswordsSinceLastLogin: 0
                },
            },
        );
    });

    test('no errors 2', () => {
        expect(JSON.stringify(adminUserDetailsUpdate(user1.authUserId, "test2@email.com", "Johnny", "Smitho"))).toBe('{}');
        expect(adminUserDetails(user1.authUserId)).toMatchObject(
            { user:
                {
                    userId: user1.authUserId,
                    name: "Johnny Smitho",
                    email: "test2@email.com",
                    numSuccessfulLogins: 1,
                    numFailedPasswordsSinceLastLogin: 0
                },
            },
        );
    });

    test('no errors 3, 20 character names', () => {
        expect(JSON.stringify(adminUserDetailsUpdate(user1.authUserId, "test3@email.com", "abcdefghijklmnopqrst", "tsrqponmlkjihgfedcab"))).toBe('{}');
        expect(adminUserDetails(user1.authUserId)).toMatchObject(
            { user:
                {
                    userId: user1.authUserId,
                    name: "abcdefghijklmnopqrst tsrqponmlkjihgfedcab",
                    email: "test3@email.com",
                    numSuccessfulLogins: 1,
                    numFailedPasswordsSinceLastLogin: 0
                },
            },
        );
    });

    test('no errors 4, 2 character names', () => {
        expect(JSON.stringify(adminUserDetailsUpdate(user1.authUserId, "test4@email.com", "ab", "ba"))).toBe('{}');
        expect(adminUserDetails(user1.authUserId)).toMatchObject(
            { user:
                {
                    userId: user1.authUserId,
                    name: "ab ba",
                    email: "test4@email.com",
                    numSuccessfulLogins: 1,
                    numFailedPasswordsSinceLastLogin: 0
                },
            },
        );
    });
})