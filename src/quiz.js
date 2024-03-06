import { getData } from './dataStore'

/**
 * Update the description of the relevant quiz.
 * 
 * @param {number} authUserId - unique user identification number
 * @param {number} quizId - a quiz's unique identification number
 * @param {string} description - description of the quiz being created
 * 
 * @returns {} - an empty object
*/
function adminQuizDescriptionUpdate(authUserId, quizId, description) {
    return {}
}

/** 
 * Update the name of the relevant quiz.
 * 
 * @param {number} authUserId - unique user identification number
 * @param {number} quizId - a quiz's unique identification number
 * @param {string} name - name of quiz created
 * 
 * @returns {} - an empty object
*/
function adminQuizNameUpdate(authUserId, quizId, name) {
    return {}
}

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 * 
 * @param {number} authUserId - unique identifier for user
 * 
 * @returns {{
*    quizzes: [
*       {
*          quizId: number, 
*          name: string
*       }
*    ]
* }} - object with list of all quizzes by their unique ID number and name. 
*
*/
function adminQuizList(authUserId) {

    return {
        quizzes: [
            {
                quizId: 1,
                name: 'My Quiz',
            }
        ]
    };
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 * 
 * @param {int} authUserId - unique user identification number
 * @param {string} name - name of quiz created
 * @param {string} description - description of the quiz being created
 * 
 * @returns {quizId: 2} - object with a unique quiz identification number
*/
function adminQuizCreate(authUserId, name, description) {
    return {
        quizId: 2
    }
}

/**
 * Given a particular quiz, permanently remove the quiz.
 * 
 * @param {number} authUserId - a user's unique identification number
 * @param {number} quizId - a quiz's unique identification number
 * 
 * @returns {} - an empty object
 */
function adminQuizRemove(authUserId, quizId) {
    return {}
}

/**
 * Get all of the relevant information about the current quiz.
 * 
 * @param {number} authUserId - a user's unique identification number
 * @param {number} quizId - a quiz's unique identification number
 * 
 * @returns {
 *      {number} quizId,
 *      {string} name,
 *      {number} timeCreated,
 *      {number} timeLastEdited,
 *      {string} description 
 * } - returns an object with details about the quiz queried for information.
 */
export function adminQuizInfo(authUserId, quizId) {
}