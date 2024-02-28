import { clear } from '../other.js'
import {getData, setData } from '../dataStore.js'
import { adminAuthRegister } from '../auth.js'

clear();
test('Test successful registration', () => {
    const authUserId1 = adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    expect(authUserId1.authUserId).toBe(1);
    const authUserId2 = adminAuthRegister('doffy@gmail.com', 'String-Str1ng', 'Donquixote', 'Doflamingo');
    expect(authUserId2.authUserId).toBe(2);
    let data = getData();
    console.log(data.users);
});

test('Check for duplicate email', () => {
    expect(adminAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp'))
        .toMatchObject({ 'error': 'User with given email already exists' });
});

test('Check for valid email', () => {
    expect(adminAuthRegister('notanEmail', 'P4ssword', 'No', 'Email'))
        .toMatchObject({ 'error': 'invalid email' });
});

test('Check for invalid nameFirst', () => {
    expect(adminAuthRegister('tonytony.chopper@gmail.com', 'racoon_dog1', 'Tony 1000', 'Chopper'))
        .toMatchObject({ 'error': 'Invalid first name' });

    expect(adminAuthRegister('monkey.d.luffy@gmail.com', 'gomugomu5', 'D', 'Monkey'))
        .toMatchObject({ 'error' : 'nameFirst does not satisfy length requirements' });

    expect(adminAuthRegister('monkey.d.luffy@gmail.com', 'gomugomu5', 'DDDDDDDDDDDDDDDDDDDDDDDD', 'Monkey'))
        .toMatchObject({ 'error' : 'nameFirst does not satisfy length requirements' });
});

test('Check for invalid nameLast', () => {
    expect(adminAuthRegister('nico.robin@gmail.com', '0hara_demon', 'Nico', 'R0bin'))
        .toMatchObject({ 'error': 'invalid last name' });

    expect(adminAuthRegister('brook@gmail.com', 'S0ul_King', 'Soul', 'K'))
        .toMatchObject({ 'error': 'nameLast does not satisfy length requirements' });

    expect(adminAuthRegister('franky@gmail.com', 'Thous4nd_sunny', 'Cutty', 'Flammmmmmmmmmmmmmmmmmm'))
        .toMatchObject({ 'error': 'nameLast does not satisfy length requirements' });
});

test('Check for invalid password', () => {
    expect(adminAuthRegister('nico.robin@gmail.com', 'ohara_demon', 'Nico', 'Robin'))
        .toMatchObject({ 'error': 'password must contain at least one letter and at least one number'});

    expect(adminAuthRegister('nico.robin@gmail.com', '123456789', 'Nico', 'Robin'))
        .toMatchObject({ 'error': 'password must contain at least one letter and at least one number'});
    
    expect(adminAuthRegister('nico.robin@gmail.com', '!@#$%^&*()', 'Nico', 'Robin'))
        .toMatchObject({ 'error': 'password must contain at least one letter and at least one number'});

    expect(adminAuthRegister('nico.robin@gmail.com', '0hara', 'Nico', 'Robin'))
        .toMatchObject({ 'error': 'password is less than 8 characters' });
});
