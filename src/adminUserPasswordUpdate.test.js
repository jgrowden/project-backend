import { clear } from './other.js'
import { adminUserPasswordUpdate, adminAuthRegister } from './quiz.js'

clear();
describe('adminUserPasswordUpdate', () => {
    test('Check for successful password change', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first_name', 'last_name');
        expect(adminUserPasswordUpdate(userId, 'p@ssw0rd', 'new_p@ssword')).toEqual({});
        expect(userId.password).toEqual('new_p@ssword');
    });
    test('Check for invalid authUserId', () => {
        expect(adminUserPasswordUpdate(1, 'p@ssw0rd', 'new_p@ssword')).toEqual({
            'error': 'Invalid authUserId'
        });
    });
    test('Check for when old password is not the correct old password', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first_name', 'last_name');
        expect(adminUserPasswordUpdate(userId, 'wrong_p@ssw0rd', 'new_p@ssword')).toEqual({
            'error': 'Old password is not correct'
        });
    });
    test('Check for when new password matches the old password exactly', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first_name', 'last_name');
        expect(adminUserPasswordUpdate(userId, 'p@ssw0rd', 'p@ssword')).toEqual({
            'error': 'New password is the same as old password'
        });
    });
    test('Check for when new password has already been used by this user', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first_name', 'last_name');
        adminUserPasswordUpdate(userId, 'p@ssw0rd', 'new_p@ssw0rd');
        expect(adminUserPasswordUpdate(userId, 'new_p@ssw0rd', 'p@ssword')).toEqual({
            'error': 'Password has been used before'
        });
    });
    test('Check for when new password is less than 8 characters', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first_name', 'last_name');
        expect(adminUserPasswordUpdate(userId, 'p@ssw0rd', 'p@ssw0r')).toEqual({
            'error': 'Password is less than 8 characters long'
        });
    });
    test('Check for when new password does not contain at least one number', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first_name', 'last_name');
        expect(adminUserPasswordUpdate(userId, 'p@ssw0rd', 'p@ssword')).toEqual({
            'error': 'Password does not contain at least one number and letter'
        })
    });
    test('Check for when new password does not contain at least one letter', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first_name', 'last_name');
        expect(adminUserPasswordUpdate(userId, 'p@ssw0rd', '12345678')).toEqual({
            'error': 'Password does not contain at least one number and letter'
        })
    });
});

