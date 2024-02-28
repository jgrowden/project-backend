import { adminQuizCreate } from '../quiz.js'
import { clear } from '../auth.js'

clear();
beforeEach(clear());

describe('adminQuizCreate test cases', () => {
    describe('success cases', () => {
        test('correct return type', () => {
            expect(adminQuizCreate(1, 'Quiz Name', 'Quiz Description')).toBe(2);
        })
    })
    describe('failure cases', () => {
        test('check for invalid user type', () => {
            expect(adminQuizCreate(-1, 'Quiz Name', 'Quiz Description')
                .toMatchObject({ 'error': 'invalid user ID' }));
        })
        test('Check for valid quiz name characters', () => {
            expect(adminQuizCreate(1, '!nvalid Name', 'Quiz Description')
                .toMatchObject({ 'error': 'invalid quiz name characters' }));
        })
        test('Check for valid quiz name length', () => {
            expect(adminQuizCreate(1, 'iq', 'Quiz Description')
                .toMatchObject({ 'error': 'invalid quiz name length: too short' }));
        })
        test('Check for valid quiz name length', () => {
            expect(adminQuizCreate(1, 'A very long quiz name, far too long', 'Quiz Description')
                .toMatchObject({ 'error': 'invalid quiz name length: too long' }));
        })
        test('Check for duplicate quiz name', () => {
            adminQuizCreate(1, 'Duplicate Quiz Name', 'Quiz Description');
            expect(adminQuizCreate(1, 'Duplicate Quiz Name', 'Quiz Description')
                .toMatchObject({ 'error': 'Duplicate quiz name length' }));
        })
        test('Check for valid quiz description length', () => {
            expect(adminQuizCreate(1, 'Quiz Name', 'A very, very, very, very, very, extraordinarily, tremendously, stupendously, ridiculously, anomolously, long description')
                .toMatchObject({ 'error': 'Quiz description invalid length' }));
        })
    })
})