import { adminQuizCreate, adminQuizNameUpdate } from '../quiz.js'
import { getData } from '../dataStore.js'
import { clear } from '../other.js'
import { adminAuthRegister } from '../auth.js'

clear();
beforeEach(() => {
    clear();
});

describe('adminQuizNameUpdate', () => { 

    test('invalid user ID', () => {
        expect(adminQuizNameUpdate('user ID', 1, 'great quiz'))
            .toStrictEqual({ 'error': 'Invalid user ID' });
    });

    test('user ID not found', () => {    
        clear();
        expect(adminQuizNameUpdate(1, 1, 'great quiz'))
            .toStrictEqual({ 'error': 'User ID not found' });
    });

    test('invalid quiz ID', () => { 
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');   
        expect(adminQuizNameUpdate(user1.authUserId, 'quizId', 'great quiz'))
            .toStrictEqual({ 'error': 'Invalid quiz ID' });
    });

    test('quiz ID not found', () => { 
        clear();
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        expect(adminQuizNameUpdate(user1.authUserId, 1, 'great quiz'))
            .toStrictEqual({ 'error': 'Quiz ID not found' });
    });

    test('quiz not owned by user', () => {  
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good'); 
        let user2 = adminAuthRegister('fancypants@gmail.com', 'f4ncyP4nts', 'Fancy', 'Pants');
        expect(adminQuizNameUpdate(user2.authUserId, quiz1.quizId, 'great quiz'))
            .toStrictEqual({ 'error': 'Quiz not owned by user' });
    });

    test('invalid characters in quiz name', () => {  
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');  
        expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, '/!greatQUIZ>>'))
            .toStrictEqual({ 'error': 'Invalid characters found in quiz name' });
    });

    test('quiz name less than 3 characters long', () => {   
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good'); 
        expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'ab'))
            .toStrictEqual({ 'error': 'Quiz name should be more than 3 characters' });
    });

    test('quiz name more than 30 characters long', () => {    
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
        expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'abcedfghijklmnopqrstuvwxyz123456789'))
            .toStrictEqual({ 'error': 'Quiz name should be less than 30 characters' });
    });

    test('quiz name already used on another quiz by logged in user', () => {   
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good'); 
        let quiz2 = adminQuizCreate(user1.authUserId, 'great quiz', 'is good');
        expect(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'great quiz'))
            .toStrictEqual({ 'error': 'Quiz name already taken' });
    });

    test('no errors 1', () => {
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
        expect(JSON.stringify(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'great quiz'))).toBe('{}');
        console.log(getData);
    });

    test('no errors 2, 3 character names', () => {
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
        expect(JSON.stringify(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'Abc'))).toBe('{}');
        console.log(getData);
    });

    test('no errors 3, 30 character names', () => {
        let user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        let quiz1 = adminQuizCreate(user1.authUserId, 'good quiz', 'is good');
        expect(JSON.stringify(adminQuizNameUpdate(user1.authUserId, quiz1.quizId, 'ABCdefghijklmnopqrstuvwxyz1234'))).toBe('{}');
        console.log(getData);
    });

});
    