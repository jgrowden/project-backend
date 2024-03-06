import { setData, getData } from './dataStore.js'

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
export function adminQuizCreate(authUserId, name, description) {
    let data = getData();

    let flag = true;
    let currUser;
    for (const user of data.users) {
        if (user.authUserId == authUserId) {
            flag = false;
            currUser = user;
        }
    }

    if (flag) {
        return { error : 'invalid user ID' };
    }

    const regex = /[^A-Za-z0-9 ]/;
    if (regex.test(name)) {
        return { error : 'invalid quiz name characters' };
    }

    if (name.length < 3) {
        return { error : 'invalid quiz name length: too short' };
    } else if (name.length > 30) {
        return { error : 'invalid quiz name length: too long' };
    }

    let duplicateQuizName = false;
    for (const quiz of currUser.userQuizzes) {
        if (data.quizzes[quiz].name === name) {
            duplicateQuizName = true;
        }
    }
    if (duplicateQuizName) {
        return { error : 'Duplicate quiz name length' };
    }

    if (description.length > 100) {
        return { error : 'Quiz description invalid length' };
    }

    const timestamp = require('unix-timestamp');

    let unix_time = Date.now();

    let newQuizId = 0;
    let currQuizId = [];
    for (const quiz in data.quizzes) {
        currQuizId.push(quiz.quizId);
    }
    while (currQuizId.includes(newQuizId)) {
        newQuizId++;
    }

    currUser.userQuizzes.push(newQuizId);
    data.quizzes.push({
        ownerId: authUserId,
        quizId: newQuizId,
        name: name,
        description: description,
        timeCreated: unix_time,
        timeLastEdited: unix_time,
    });

    setData(data);
    return { quizId: newQuizId };
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
    let data = getData();

    let userFlag = true;
    let currUser;
    for (const user of data.users) {
        if (user.authUserId == authUserId) {
            userFlag = false;
            currUser = user;
        }
    }

    let quizFlag = true;
    let currQuiz;
    for (const quiz of data.quizzes) {
        if (quiz.quizId == quizId) {
            quizFlag = false;
            currQuiz = quiz;
        }
    }

    if (userFlag) {
        return { error : 'invalid user ID' };
    }

    if (quizFlag) {
        return { error : 'invalid quiz ID' };
    }

    if (!currUser.userQuizzes.includes(quizId)) {
        return { error : 'you do not own this quiz' };
    }

    return {
        quizId: quizId,
        name: currQuiz.quizId,
        timeCreated: currQuiz.timeCreated,
        timeLastEdited: currQuiz.timeLastEdited,
        description: currQuiz.description,
    }
}