/**
 * Register a user with an email, password, and names, 
 * then returns their authUserId value.
 */
function adminAuthRegister(email, password, nameFirst, nameLast) {
    return {
        authUserId: 1,
    }
}

/**
 * Given a registered user's email and password,
 * returns their authUserId value.
 */
function adminAuthLogin(email, password) {
    return {
        authUserId: 1,
    }
}