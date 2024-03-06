import { adminQuizCreate } from '../quiz.js'
import { clear } from '../other.js'
import { adminAuthRegister } from '../auth.js'
import { getData } from '../dataStore.js'

clear();
beforeEach(() => {
    clear();
});

describe('adminQuizCreate test cases', () => {
    describe('success cases', () => {
        test('correct return type', () => {
            let userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            expect(adminQuizCreate(userId.authUserId, 'Quiz Name', 'Quiz Description')).toMatchObject({ quizId : expect.any(Number) });
        })
    })
    describe('failure cases', () => {
        test('check for invalid user type', () => {
            expect(adminQuizCreate(-1, 'Quiz Name', 'Quiz Description'))
                .toMatchObject({ error : expect.any(String) });
        })
        test('Check for valid quiz name characters', () => {
            let userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            expect(adminQuizCreate(userId.authUserId, '!nvalid Name', 'Quiz Description'))
                .toMatchObject({ error : expect.any(String) });
        })
        test('Check for valid quiz name length', () => {
            let userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            expect(adminQuizCreate(userId.authUserId, 'iq', 'Quiz Description'))
                .toMatchObject({ error : expect.any(String) });
        })
        test('Check for valid quiz name length', () => {
            let userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            expect(adminQuizCreate(userId.authUserId, 'A very long quiz name which is far too long', 'Quiz Description'))
                .toMatchObject({ error : expect.any(String) });
        })
        test('Check for duplicate quiz name', () => {
            let userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            adminQuizCreate(userId.authUserId, 'Duplicate Quiz Name', 'Quiz Description');
            expect(adminQuizCreate(userId.authUserId, 'Duplicate Quiz Name', 'Quiz Description'))
                .toMatchObject({ error : expect.any(String) });
        })
        test('Check for valid quiz description length', () => {
            let userId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            expect(adminQuizCreate(userId.authUserId, 'Quiz Name', 'A very, very, very, very, very, extraordinarily, tremendously, stupendously, ridiculously, anomolously, long description'))
                .toMatchObject({ error : expect.any(String) });
        })
    })
})