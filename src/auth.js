/**
 * Given a registered user's email and password,
 * returns their authUserId value.
 * 
 * @param {string} email
 * @param {string} password
 * @returns {number} authUserId
 */
function adminAuthLogin(email, password) {
    return {
        authUserId: 1,
    }
}

/**
 * Reset the state of the application back to the start.
 */
function clear() {

    return {};
}

/**
<<<<<<< HEAD
 * Given an admin user's authUserId, return details about the user.
 * 
 * "name" is the first and last name concatenated with a single space between them.
 * 
 * authUserId seems to be the input number, while the user object contains just 'userId'.
 * They should be mean the same thing though.
 * 
 * @param {number} authUserId 
 * @return {{
*      user: {
    *          userId: number, 
    *          name: string,
    *          email: string, 
    *          numSuccessfulLogins: number, 
    *          numFailedPasswordsSinceLastLogin: number
    *      }
    *  }}
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

/*
 * Given an admin user's authUserId and a set of properties, 
 *  update the properties of this logged in admin user.
 * 
 * @param {number} authUserId - unique identifier for user
 * @param {string} email - user's email
 * @param {string} nameFirst - user's first name
 * @param {string} nameLast - user's last name
 * @return {} // an empty object
 */
function adminUserDetailsUpdate(authUserId, email, nameFirst, nameLast) {

    return {};
}

/**
 * Reset the state of the application back to the start.
 */
function clear() {

    return {};
}
