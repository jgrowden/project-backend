
// invalid ID, invalid email, invalid first name, invalid last name
// ID does not exist
// email used by another user
// email does not satisfy validator https://www.npmjs.com/package/validator
/*
AuthUserId is not a valid user.
      Email is currently used by another user (excluding the current authorised user)
      Email does not satisfy this: https://www.npmjs.com/package/validator (validator.isEmail)
      NameFirst contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
      NameFirst is less than 2 characters or more than 20 characters
      NameLast contains characters other than lowercase letters, uppercase letters, spaces, hyphens, or apostrophes
      NameLast is less than 2 characters or more than 20 characters

function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {
*/

import { clear } from "../other.js";
import { adminAuthRegister, adminUserDetails, adminUserDetailsUpdate } from "../auth";
import { getData } from "../dataStore";

describe('adminUserDetailsUpdate testing', () => {
    
    let user1;
    let user2;

    beforeEach(() => {
        clear();
        user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
        user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    });

    test('invalid ID', () => {
        expect(adminUserDetailsUpdate("invalid id", "test@email.com", "John", "Smith"))
        .toMatchObject({ 'error': 'Invalid ID' });
    });
    
    test('ID does not exist', () => {
        expect(adminUserDetailsUpdate(5, "test@email.com", "Amog", "Us"))
        .toMatchObject({ 'error': 'User ID not found' });
    });

    test('email used by another user', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "go.d.usopp@gmail.com", "John", "Smith"))
        .toMatchObject({ 'error': 'Email already registered' });
    });

    test('email does not satisfy validator', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "not_an_email", "John", "Smith"))
        .toMatchObject({ 'error': 'Invalid email' });
    });

    test('invalid characters in nameFirst 1', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "Jo!hn", "Smith"))
        .toMatchObject({ 'error': 'Invalid first name' });
    });

    test('invalid characters in nameFirst 2', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "J0hn", "Smith"))
        .toMatchObject({ 'error': 'Invalid first name' });
    });

    test('nameFirst less than 2 characters long', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "J", "Smith"))
        .toMatchObject({ 'error': 'Names should be 2 or more characters' });
    });

    test('nameFirst more than 20 characters long', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "Abcdefghijklmnopqrstuvwxyz", "Smith"))
        .toMatchObject({ 'error': 'Names should be 20 or less characters' });
    });

    test('invalid characters in nameLast 1', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "Sm1th"))
        .toMatchObject({ 'error': 'Invalid last name' });

    });

    test('invalid characters in nameLast 1', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "Sm@th"))
        .toMatchObject({ 'error': 'Invalid last name' });
    });

    test('nameLast less than 2 characters', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "S"))
        .toMatchObject({ 'error': 'Names should be 2 or more characters' });
    });

    test('nameLast more than 20 characters', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "Abcdefghijklmnopqrstuvwxyz"))
        .toMatchObject({ 'error': 'Names should be 20 or less characters' });
    });

    test('no errors 1', () => {
        expect(JSON.stringify(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "Smith"))).toBe('{}');
        console.log(getData);
    });

    test('no errors 2', () => {
        expect(JSON.stringify(adminUserDetailsUpdate(user1.authUserId, "test2@email.com", "Johnny", "Smitho"))).toBe('{}');
        console.log(getData());
    });

    test('no errors 3, 20 character names', () => {
        expect(JSON.stringify(adminUserDetailsUpdate(user1.authUserId, "test3@email.com", "abcdefghijklmnopqrst", "tsrqponmlkjihgfedcab"))).toBe('{}');
        console.log(getData());
    });

    test('no errors 4, 2 character names', () => {
        expect(JSON.stringify(adminUserDetailsUpdate(user1.authUserId, "test4@email.com", "ab", "ba"))).toBe('{}');
        console.log(getData());
    });
})