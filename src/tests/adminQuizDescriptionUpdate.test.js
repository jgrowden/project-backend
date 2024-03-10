import { adminQuizCreate, adminQuizDescriptionUpdate, adminQuizInfo } from '../quiz.js'
import { clear } from '../other.js'
import { adminAuthRegister } from '../auth.js'

clear();
beforeEach(() => {
    clear();
});

describe('adminQuizDescriptionUpdate', () => { 

    test('invalid user ID', () => {
        expect(adminQuizDescriptionUpdate('user ID', 1, 'is great'))
            .toStrictEqual( { error: expect.any(String) });
    });

    test('user ID not found', () => {    
        clear();
        expect(adminQuizDescriptionUpdate(1, 1, 'is great'))
            .toStrictEqual( { error: expect.any(String) });
    });

    test('invalid quiz ID', () => { 
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');   
        expect(adminQuizDescriptionUpdate(user1.authUserId, 'quizId', 'is great'))
            .toStrictEqual(  { error: expect.any(String) });
    });

    test('quiz ID not found', () => { 
        clear();
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        expect(adminQuizDescriptionUpdate(user1.authUserId, 1, 'is great'))
            .toStrictEqual( { error: expect.any(String) } );
    });

    test('quiz not owned by user', () => {  
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good'); 
        let user2 = adminAuthRegister('fancypants@gmail.com', 'f4ncyP4nts', 'Fancy', 'Pants');
        expect(adminQuizDescriptionUpdate(user2.authUserId, quiz1.quizId, 'is great'))
            .toStrictEqual( { error: expect.any(String) } );
    });

    test('quiz name more than 100 characters long', () => {    
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
        expect(adminQuizDescriptionUpdate(user1.authUserId, quiz1.quizId, 'abcedfghijklmnopqrstuvwxyzabcedfghijklmnopqrstuvwxyzabcedfghijklmnopqrstuvwxyzabcedfghijklmnopqrstuvwxyz'))
            .toStrictEqual( { error: expect.any(String) } );
    });

    test('no errors 1', () => {
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
        expect(JSON.stringify(adminQuizDescriptionUpdate(user1.authUserId, quiz1.quizId, 'is great'))).toBe('{}');
        expect(adminQuizInfo(user1.authUserId, quiz1.quizId)).toMatchObject({
            quizId: quiz1.quizId,
            name: 'good quiz',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: 'is great',
        });
    });

    test('no errors 2, 0 length string', () => {
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
        expect(JSON.stringify(adminQuizDescriptionUpdate(user1.authUserId, quiz1.quizId, ''))).toBe('{}');
        expect(adminQuizInfo(user1.authUserId, quiz1.quizId)).toMatchObject({
            quizId: quiz1.quizId,
            name: 'good quiz',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: '',
        });
    });

    test('no errors 3, 100 character names', () => {
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
        expect(JSON.stringify(adminQuizDescriptionUpdate(user1.authUserId, quiz1.quizId, '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789'))).toBe('{}');
        expect(adminQuizInfo(user1.authUserId, quiz1.quizId)).toMatchObject({
            quizId: quiz1.quizId,
            name: 'good quiz',
            timeCreated: expect.any(Number),
            timeLastEdited: expect.any(Number),
            description: '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789',
        });
    });

});
    