import { adminQuizCreate, adminQuizInfo } from '../quiz.js'
import { clear } from '../other.js'
import { adminAuthRegister } from '../auth.js'

clear();
beforeEach(() => {
    clear();
});

describe('adminQuizInfo test cases', () => {
    describe('success cases', () => {
        test('correct return type', () => {
            let user = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            let quiz = adminQuizCreate(user.authUserId, 'quiz name', 'quiz description');
            expect(adminQuizInfo(user.authUserId, quiz.quizId)).toMatchObject({
                quizId: quiz.quizId,
                name: 'quiz name',
                timeCreated: expect.any(Number),
                timeLastEdited: expect.any(Number),
                description: 'quiz description',
            });
        })
    })
    describe('failure cases', () => {
        test('check for invalid user ID', () => {
            expect(adminQuizInfo(-1, 1))
                .toMatchObject({ error : 'invalid user ID' });
        })
        test('Check for invalid quiz ID', () => {
            let user = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            expect(adminQuizInfo(user.authUserId, -1))
                .toMatchObject({ error : 'invalid quiz ID' });
        })
        test('Check for valid quiz ownership', () => {
            let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
            let user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
            let user2quiz = adminQuizCreate(user2.authUserId, 'quiz name', 'quiz description');
            expect(adminQuizInfo(user1.authUserId, user2quiz.quizId))
                .toMatchObject({ error : 'you do not own this quiz' });
        })
    })
})
