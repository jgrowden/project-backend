import { clear } from '../other.js'
import {getData, setData } from '../dataStore.js'
import { adminAuthRegister } from '../auth.js'

clear();
test('Test successful registration', () => {
    let authUserId = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    expect(authUserId.authUserId).toBe(1);
    let data = getData();
    console.log(data.users);
});

test('Check for duplicate email', () => {
    expect(adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp'))
        .toMatchObject({ "error": "User with given email already exists" });
});

test('Check for invalid nameFirst', () => {
    expect(adminAuthRegister('tonytony.chopper@gmail.com', 'racoon_dog1', 'Tony 1000', 'Chopper'))
        .toMatchObject({ "error": "Invalid first name" });

    expect(adminAuthRegister('monkey.d.luffy@gmail.com', 'gomugomu5', 'D', 'Monkey'))
        .tomatchObject({ "error" : "nameFirst does not exceed minimum character count" });

    expect(adminAuthRegister('monkey.d.luffy@gmail.com', 'gomugomu5', 'DDDDDDDDDDDDDDDDDDDDDDDD', 'Monkey'))
        .tomatchObject({ "error" : "nameFirst exceeds maximum character count" });
});

test('Check for invalid nameLast', () => {
    expect(adminAuthRegister('nico.robin@gmail.com', '0hara_demon', 'Nico', 'R0bin'))
        .toMatchObject({ "error": "invalid last name" });

    expect(adminAuthRegister('brook@gmail.com', 'S0ul_King', 'Soul', 'K'))
        .toMatchObject({ "error": "last name does not exceed minimum" });

    expect(adminAuthRegister('franky@gmail.com', 'Thous4nd_sunny', 'Cutty', 'Flammmmmmmmmmmmmmmmmmm')
        .toMatchObject({ "error": "last name exceeds maximum"}))
});

test('Check for invalid password', () => {
    expect(adminAuthRegister('nico.robin@gmail.com', 'ohara_demon', 'Nico', 'Robin'))
        .toMatchObject({ "error": "password doesn't contain at least one number"});

    expect(adminAuthRegister('nico.robin@gmail.com', '123456789', 'Nico', 'Robin'))
        .toMatchObject({ "error": "password doesn't contain at least one letter"});

    expect(adminAuthRegister('nico.robin@gmail.com', '0hara', 'Nico', 'Robin'))
        .toMatchObject({ "error": "password is less than 8 characters"});
});