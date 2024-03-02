import { clear } from '../other.js'
import { adminUserPasswordUpdate, adminAuthRegister } from '../auth.js'
import { getData } from "../dataStore";


describe('adminUserPasswordUpdate', () => {
    beforeEach(() => {
        clear();
    });
    test('Check for invalid authUserId', () => {
        expect(adminUserPasswordUpdate(1, 'p@ssw0rd', 'new_p@ssw0rd')).toEqual({
            'error': 'Invalid authUserId'
        });
    });
    test('Check for when old password is not the correct old password', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
        expect(adminUserPasswordUpdate(userId.authUserId, 'wrong_p@ssw0rd', 'new_p@ssword')).toEqual({
            'error': 'Old password is not correct'
        });
    });
    test('Check for when new password matches the old password exactly', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
        expect(adminUserPasswordUpdate(userId.authUserId, 'p@ssw0rd', 'p@ssw0rd')).toEqual({
            'error': 'New password is the same as old password'
        });
    });
    test('Check for when new password has already been used by this user', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
        adminUserPasswordUpdate(userId.authUserId, 'p@ssw0rd', 'new_p@ssw0rd');
        expect(adminUserPasswordUpdate(userId.authUserId, 'new_p@ssw0rd', 'p@ssw0rd')).toEqual({
            'error': 'Password has been used before'
        });
    });
    test('Check for when new password is less than 8 characters', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
        expect(adminUserPasswordUpdate(userId.authUserId, 'p@ssw0rd', 'p@ssw0r')).toEqual({
            'error': 'Password is less than 8 characters'
        });
    });
    test('Check for when new password does not contain at least one number', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
        expect(adminUserPasswordUpdate(userId.authUserId, 'p@ssw0rd', 'p@ssword')).toEqual({
            'error': 'Password must contain at least one letter and at least one number'
        })
    });
    test('Check for when new password does not contain at least one letter', () => {
        const userId = adminAuthRegister('email@gmail.com', 'p@ssw0rd', 'first-name', 'last-name');
        expect(adminUserPasswordUpdate(userId.authUserId, 'p@ssw0rd', '12345678')).toEqual({
            'error': 'Password must contain at least one letter and at least one number'
        })
    });
});

