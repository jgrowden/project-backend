import { clear } from '../other.js'
import { getData, setData } from '../dataStore.js'
import { adminAuthRegister } from '../auth.js'
import { adminQuizNameUpdate, adminQuizCreate } from '../quiz.js'

describe('adminQuizNameUpdate', () => { 

    beforeEach(() => {
        clear();
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
    });

    test('invalid user ID', () => {    
        expect(adminQuizNameUpdate('userID', quiz1.quizId, 'great quiz'))
            .toStrictEqual({ 'error': 'Invalid user ID' });
    });

    test('user ID not found', () => {    
        clear();
        expect(adminQuizNameUpdate(1, quiz1.quizID, 'great quiz'))
            .toStrictEqual({ 'error': 'User ID not found' });
    });

    test('invalid quiz ID', () => {    
        expect(adminQuizNameUpdate(user1.authUserId, 'quizID', 'great quiz'))
            .toStrictEqual({ 'error': 'Invalid quiz ID' });
    });

    test('quiz ID not found', () => { 
        clear();
        user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        expect(adminQuizNameUpdate(user1.authUserId, 1, 'great quiz'))
            .toStrictEqual({ 'error': 'Quiz ID not found' });
    });

    test('quiz not owned by user', () => {    
        let user2 = adminAuthRegister('fancypants@gmail.com', 'f4ncyP4nts', 'Fancy', 'Pants');
        expect(adminQuizNameUpdate(user2.authUserId, quiz1.quizID, 'great quiz'))
            .toStrictEqual({ 'error': 'Quiz not owned by user' });
    });

    test('invalid characters in quiz name', () => {    
        expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizID, '/!greatQUIZ>>'))
            .toStrictEqual({ 'error': 'Invalid characters found in quiz name' });
    });

    test('quiz name less than 3 characters long', () => {    
        expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizID, 'ab'))
            .toStrictEqual({ 'error': 'Quiz name should be more than 3 characters' });
    });

    test('quiz name more than 30 characters long', () => {    
        expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizID, 'abcedfghijklmnopqrstuvwxyz123456789'))
            .toStrictEqual({ 'error': 'Quiz name should be less than 30 characters' });
    });

    test('quiz name already used on another quiz by logged in user', () => {    
        let quiz2 = adminQuizCreate(user1.authUserId, 'great quiz', 'is good');
        expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizID, 'great quiz'))
            .toStrictEqual({ 'error': 'Quiz name already taken' });
    });

    test('no errors 1', () => {
        expect(JSON.stringify(adminQuizNameUpdate(user1.authUserId, quiz1.quizID, 'great quiz'))).toBe('{}');
        console.log(getData);
    });

    test('no errors 2, 3 character names', () => {
        expect(JSON.stringify(adminQuizNameUpdate(user1.authUserId, quiz1.quizID, 'Abc'))).toBe('{}');
        console.log(getData);
    });

    test('no errors 3, 30 character names', () => {
        expect(JSON.stringify(adminQuizNameUpdate(user1.authUserId, quiz1.quizID, 'ABCdefghijklmnopqrstuvwxyz1234'))).toBe('{}');
        console.log(getData);
    });

});
    