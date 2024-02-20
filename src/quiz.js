
/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 * 
 * @param {number} authUserId - unique identifier for user
 * @returns {{quizzes: [{quizId: number, name: string}]}} - object with list of all quizzes
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