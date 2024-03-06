import { adminQuizCreate } from '../quiz.js'
import { clear } from '../other.js'
import {adminAuthRegister} from '../auth.js'

clear();
beforeEach(() => {
    clear();
});

describe('adminQuizCreate test cases', () => {
    describe('success cases', () => {
        test('correct return type', () => {
            let userId = adminAuthRegister("john.smith@email.com", "JohnSmith1", "John", "Smith");
            expect(adminQuizCreate(userId, 'Quiz Name', 'Quiz Description')).toBe(0);
        })
    })
    describe('failure cases', () => {
        test('check for invalid user type', () => {
            expect(adminQuizCreate(-1, 'Quiz Name', 'Quiz Description'))
                .toMatchObject({ 'error': 'invalid user ID' });
        })
        test('Check for valid quiz name characters', () => {
            let userId = adminAuthRegister("john.smith@email.com", "JohnSmith1", "John", "Smith");
            expect(adminQuizCreate(userId, '!nvalid Name', 'Quiz Description'))
                .toMatchObject({ 'error': 'invalid quiz name characters' });
        })
        test('Check for valid quiz name length', () => {
            let userId = adminAuthRegister("john.smith@email.com", "JohnSmith1", "John", "Smith");
            expect(adminQuizCreate(userId, 'iq', 'Quiz Description'))
                .toMatchObject({ 'error': 'invalid quiz name length: too short' });
        })
        test('Check for valid quiz name length', () => {
            let userId = adminAuthRegister("john.smith@email.com", "JohnSmith1", "John", "Smith");
            expect(adminQuizCreate(userId, 'A very long quiz name, far too long', 'Quiz Description'))
                .toMatchObject({ 'error': 'invalid quiz name length: too long' });
        })
        test('Check for duplicate quiz name', () => {
            let userId = adminAuthRegister("john.smith@email.com", "JohnSmith1", "John", "Smith");
            adminQuizCreate(userId, 'Duplicate Quiz Name', 'Quiz Description');
            expect(adminQuizCreate(userId, 'Duplicate Quiz Name', 'Quiz Description'))
                .toMatchObject({ 'error': 'Duplicate quiz name length' });
        })
        test('Check for valid quiz description length', () => {
            let userId = adminAuthRegister("john.smith@email.com", "JohnSmith1", "John", "Smith");
            expect(adminQuizCreate(userId, 'Quiz Name', 'A very, very, very, very, very, extraordinarily, tremendously, stupendously, ridiculously, anomolously, long description'))
                .toMatchObject({ 'error': 'Quiz description invalid length' });
        })
    })
})