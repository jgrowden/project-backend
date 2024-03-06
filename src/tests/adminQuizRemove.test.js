import { adminQuizCreate, adminQuizRemove } from '../quiz.js'
import { clear } from '../other.js'
import { adminAuthRegister } from '../auth.js'

clear();
beforeEach(() => {
    clear();
});

describe('adminQuizRemove test cases', () => {
    describe('success cases', () => {
        test('correct return type', () => {
            let user = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            let quiz = adminQuizCreate(user.authUserId, 'quiz name', 'quiz description');
            expect(adminQuizRemove(user.authUserId, quiz.quizId)).toMatchObject({ });
        })
    })
    describe('failure cases', () => {
        test('check for invalid user ID', () => {
            expect(adminQuizRemove(-1, 1))
                .toMatchObject({ error : expect.any(String) });
        })
        test('Check for invalid quiz ID', () => {
            let user = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            expect(adminQuizRemove(user.authUserId, -1))
                .toMatchObject({ error : expect.any(String) });
        })
        test('Check for valid quiz ownership', () => {
            let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            let user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
            let user2quiz = adminQuizCreate(user2.authUserId, 'quiz name', 'quiz description');
            expect(adminQuizRemove(user1.authUserId, user2quiz.quizId))
                .toMatchObject({ error : expect.any(String) });
        })
    })
})
