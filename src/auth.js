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