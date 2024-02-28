import { clear } from '../other.js'
import { adminAuthRegister } from '../auth.js'

beforeEach(clear());
describe ('Testing adminAuthLogin', () => {
    test('Test successful login', () => {
        const user = adminAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
        expect(adminAuthLogin('gon.freecs@gmail.com', 'GonF1shing'))
            .toStrictEqual(user);
    });

    test('Test unsuccessful login with non-existent email', () => {
        expect(adminAuthLogin('killua@gmail.com', 'k1loWatt'))
            .toStrictEqual({ 'error': 'invalid email and/or password'})
    });

    test('Test unsuccessful login with valid email, incorrect password', () => {
        const user = adminAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
        expect(adminAuthLogin('gon.freecs@gmail.com', 'F1rstComesR0ck!'))
            .toStrictEqual({ 'error': 'invalid email and/or password'});
    });
    
})