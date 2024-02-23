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
function adminAuthRegister(email, password, nameFirst, nameLast) {

    return {
        authUserId: 1,
    }
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
 * "name" is the first and last name concatenated with a single space between them.
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
function adminUserDetails(authUserId) {

    return {
        user: {
            userId: 1,
            name: 'Hayden Smith',
            email: 'hayden.smith@unsw.edu.au',
            numSuccessfulLogins: 3,
            numFailedPasswordsSinceLastLogin: 1,
        },
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
