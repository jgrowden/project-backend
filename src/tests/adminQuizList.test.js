import { clear } from './other.js'
import { adminQuizList, adminAuthRegister, adminQuizCreate } from './quiz.js'

describe('adminQuizList', () => {
    test('returning list of quizzes', () => {
        clear();
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first_name', 'last_name');
        const quizId1 = adminQuizCreate(userId, 'quiz1', 'the first quiz');
        const quizId2 = adminQuizCreate(userId, 'quiz2', 'the second quiz');
        expect(adminQuizList(userId)).toEqual({
            quizzes: [
                {
                    quizId: quizId1,
                    name: 'quiz1' ,
                },
                {
                    quizId: quizId2,
                    name: 'quiz2',
                }
            ]
        });
        });
    test('returning list of quizzes for multiple users', () => {
        clear();
        const userId1 = adminAuthRegister('email1@gmail.com', 'p@ssw0rd', 'first_name', 'last_name');
        const userId2 = adminAuthRegister('email2@gmail.com', 'p@ssw0rd', 'first_name', 'last_name');
        const quizId1 = adminQuizCreate(userId1, 'quiz1', 'the first quiz');
        const quizId2 = adminQuizCreate(userId2, 'quiz2', 'the second quiz');
        const quizId3 = adminQuizCreate(userId1, 'quiz3', 'the third quiz');
        expect(adminQuizList(userId1)).toEqual({
            quizzes: [
                {
                    quizId: quizId1,
                    name: 'quiz1' ,
                },
                {
                    quizId: quizId3,
                    name: 'quiz2',
                }
            ]
        });
        expect(adminQuizList(userId2)).toEqual({
            quizzes: [
                {
                    quizId: quizId2,
                    name: 'quiz2',
                }
            ]
        });
    });
    test('returning empty list of quizzes', () => {
        clear();
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first_name', 'last_name');
        expect(adminQuizList(userId)).toEqual({
            quizzes: []
        });
    });
    test ('invalid authUserId', () => {
        clear();
        expect(adminQuizList(1)).toEqual({
            'error': 'Invalid authUserId'
        });
    });
});

