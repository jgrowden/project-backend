
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

import { clear } from "console";
import { adminAuthRegister, adminUserDetails, adminUserDetailsUpdate } from "../auth";
import { getData } from "../dataStore";

beforeEach(() => {
    clear();
    const user1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    const user2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
});

describe('adminUserDetailsUpdate testing', () => {
    test('invalid ID', () => {
        expect(adminUserDetailsUpdate("invalid id", "test@email.com", "John", "Smith")).toHaveProperty("error");
    });
    test('ID does not exist', () => {
        expect(adminUserDetailsUpdate(5, "test@email.com", "Amog", "Us")).toHaveProperty("error");
    });
    test('email used by another user', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "go.d.usopp@gmail.com", "John", "Smith")).toHaveProperty("error");
    });
    test('email does not satisfy validator', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "not_an_email", "John", "Smith")).toHaveProperty("error");
    });
    test('invalid characters in nameFirst 1', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "Jo!hn", "Smith")).toHaveProperty("error");
    });
    test('invalid characters in nameFirst 2', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "J0hn", "Smith")).toHaveProperty("error");
    });
    test('nameFirst less than 2 characters long', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "J", "Smith")).toHaveProperty("error");
    });
    test('nameFirst more than 20 characters long', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "Abcdefghijklmnopqrstuvwxyz", "Smith")).toHaveProperty("error");
    });
    test('invalid characters in nameLast 1', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "Sm1th")).toHaveProperty("error");

    });
    test('invalid characters in nameLast 1', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "Sm@th")).toHaveProperty("error");
    });
    test('nameLast less than 2 characters', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "S")).toHaveProperty("error");
    });
    test('nameLast more than 20 characters', () => {
        expect(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "Abcdefghijklmnopqrstuvwxyz")).toHaveProperty("error");
    });
    test('no errors 1', () => {
        expect(JSON.stringify(adminUserDetailsUpdate(user2.authUserId, "test@email.com", "John", "Smith"))).toBe('{}');
        console.log(getData);
    });
    test('no errors 2', () => {
        expect(JSON.stringify(adminUserDetailsUpdate(user1.authUserId, "test2@email.com", "Johnny", "Smitho"))).toBe('{}');
        console.log(getData());
    });
})