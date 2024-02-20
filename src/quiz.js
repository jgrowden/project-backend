/**
 * Given basic details about a new quiz, create one for the logged in user.
 * 
 * @param {int} authUserId - unique user identification number
 * @param {string} name - name of quiz created
 * @param {string} description - description of the quiz being created
 * @returns {quizId: 2} - object with a unique quiz identification number
*/

function adminQuizCreate(authUserId, name, description) {
    return {
        quizId: 2
    }
}

