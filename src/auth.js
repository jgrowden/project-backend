import { getData, setData } from './dataStore.js'
import validator from '../node_modules/validator'
/**
 * Register a user with an email, password, and names, 
 * then returns their authUserId value.
 * 
 * @param {string} email - user's email
 * @param {string} password - user's password
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 * 
 * @returns {number} authUserId - the user's unique identification number 
 */
export function adminAuthRegister(email, password, nameFirst, nameLast) {
    let data = getData();

    // Check for duplicate email
    for (const user of data.users) {
        if (user.email === email) {
            return { 'error': 'User with given email already exists' };
        }
    }
    // Check for invalid email
    if (!validator.isEmail(email)) {
        return { 'error': 'invalid email' };
    }
    const validChars = createValidCharsArray();

    // Check for invalid first name
    if (!validator.isWhitelisted(nameFirst, validChars)) {
        return { 'error': 'Invalid first name' };
    }
    if (nameFirst.length < 2 || nameFirst.length > 20) {
        return { 'error' : 'nameFirst does not satisfy length requirements' };
    }

    // Check for invalid last name
    if (!validator.isWhitelisted(nameLast, validChars)) {
        return { 'error': 'invalid last name' };
    }
    if (nameLast.length < 2 || nameLast.length > 20) {
        return { 'error' : 'nameLast does not satisfy length requirements' };
    }

    // Check for invalid password
    if (password.length < 8) {
        return { 'error': 'password is less than 8 characters' };
    }
    if (!hasLetterAndNumber(password)) {
        return { 'error': 'password must contain at least one letter and at least one number'};
    }

    data.users.push({
        email: email,
        password: password,
        nameFirst: nameFirst,
        nameLast: nameLast,
        authUserId: data.users.length + 1,
        numSuccessfulLogins: 1,
        numFailedPasswordsSinceLastLogin: 0,
        userQuizzes: [],
    })
    return {
        authUserId: data.users.length,
    }
}

/**
 * Creates an array of chars containing only:
 *      - Lowercase letters
 *      - Uppercase letters
 *      - Space, hyphen and apostrophe
 * @returns Array of chars
 */

function createValidCharsArray() {
    const validChars = [];

    // add lowercase letters
    for (let i = 97; i <= 122; i++) {
        validChars.push(String.fromCharCode(i));
    }

    // add uppercase letters
    for (let i = 65; i <= 90; i++) {
        validChars.push(String.fromCharCode(i));
    }
    validChars.push(' ', '-', '\'');

    return validChars;
}

/**
 * Returns true if the given string contains at least one letter
 * and at least one number. False otherwise.
 * @param {string} 
 * @returns {boolean}
 */
function hasLetterAndNumber(str) {
    return /[a-zA-Z]/.test(str) && /[0-9]/.test(str);
}

/**
 * Given a registered user's email and password,
 * returns their authUserId value.
 * 
 * @param {string} email - user's email 
 * @param {string} password - user's password
 * 
 * @returns {number} authUserId - the user's unique identification number 
 */
function adminAuthLogin(email, password) {

    return {
        authUserId: 1,
    }
}

/**
 * Given an admin user's authUserId, return details about the user.
 * 
 * 'name' is the first and last name concatenated with a single space between them.
 * 
 * Note: authUserId seems to be the input number, while the user object contains
 * just 'userId'. They should be mean the same thing though.
 * 
 * @param {number} authUserId - unique identifier for user
 * 
 * @return {{
 *      user: {
 *          userId: number, 
 *          name: string,
 *          email: string, 
 *          numSuccessfulLogins: number, 
 *          numFailedPasswordsSinceLastLogin: number
 *      }
 *   }} - an object containing key information about the user queried. 
*/
export function adminUserDetails(authUserId) {

    if (typeof authUserId !== "number") {
        return {error: "Invalid User ID Provided"};
    }

    const data = getData();
    for (let user of data.users) {
        if (user.authUserId === authUserId) {
            return {
                user: {
                    userId: user.authUserId,
                    name: `${user.nameFirst} ${user.nameLast}`,
                    email: user.email,
                    numSuccessfulLogins: user.numSuccessfulLogins,
                    numFailedPasswordsSinceLastLogin: user.numFailedPasswordsSinceLastLogin,
                },
            };
        }
    }

    return {
        error: "User ID not found",
    };
}


/**
 * Given an admin user's authUserId and a set of properties, 
 *  update the properties of this logged in admin user.
 * 
 * @param {number} authUserId - unique identifier for user
 * @param {string} email - user's email
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 * 
 * @return {} - an empty object
*/
function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {

    return {};
}

/**
 * Given details relating to a password change, update the password of a logged in user.
 * 
 * @param {number} authUserId - unique identifier for user
 * @param {string} oldPassword - user's old password
 * @param {string} newPassword - user's new password
 * 
 * @return {} - an empty object
*/    

function adminUserPasswordUpdate(authUserId, oldPassword, newPassword) {

    return {};
}
