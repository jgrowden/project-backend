import { getData, setData } from './dataStore.js'
/**
 * Update the description of the relevant quiz.
 * 
 * @param {number} authUserId - unique user identification number
 * @param {number} quizId - a quiz's unique identification number
 * @param {string} description - description of the quiz being created
 * 
 * @returns {} - an empty object
*/
export function adminQuizDescriptionUpdate(authUserId, quizId, description) {

    let data = getData();

    let userFlag = true;
    let currUser;
    for (const user of data.users) {
        if (user.authUserId === authUserId) {
            userFlag = false;
            currUser = user;
        }
    }

    let quizFlag = true;
    let currQuiz;
    for (const quiz of data.quizzes) {
        if (quiz.quizId === quizId) {
            quizFlag = false;
            currQuiz = quiz;
        }
    }

    if (typeof authUserId !== 'number') {
        return { error : 'Invalid user ID' }
    };

    if (userFlag) {
        return { error : 'User ID not found' };
    }
    
    if (typeof quizId !== 'number') {
        return { error : 'Invalid quiz ID' }
    };

    if (quizFlag) {
        return { error : 'Quiz ID not found' };
    }

    if (!currUser.userQuizzes.includes(quizId)) {
        return { error : 'Quiz not owned by user' };
    }

    const maxNameLength = 100;

    if (description.length > maxNameLength) {
        return { error : 'Quiz description should be less than 100 characters' };
    }

    currQuiz.description = description;

    setData(data);

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
export function adminQuizNameUpdate(authUserId, quizId, name) {

    let data = getData();

    let userFlag = true;
    let currUser;
    for (const user of data.users) {
        if (user.authUserId === authUserId) {
            userFlag = false;
            currUser = user;
        }
    }

    let quizFlag = true;
    let currQuiz;
    for (const quiz of data.quizzes) {
        if (quiz.quizId === quizId) {
            quizFlag = false;
            currQuiz = quiz;
        }
    }

    if (typeof authUserId !== 'number') {
        return { error : 'Invalid user ID' }
    };

    if (userFlag) {
        return { error : 'User ID not found' };
    }
    
    if (typeof quizId !== 'number') {
        return { error : 'Invalid quiz ID' }
    };

    if (quizFlag) {
        return { error : 'Quiz ID not found' };
    }

    if (!currUser.userQuizzes.includes(quizId)) {
        return { error : 'Quiz not owned by user' };
    }

    const regex = /[^A-Za-z0-9 ]/;
    if (regex.test(name)) {
        return { error : 'Invalid characters found in quiz name' };
    }

    const minNameLength = 3;
    const maxNameLength = 30;

    if (name.length < minNameLength) {
        return { error : 'Quiz name should be more than 3 characters' };
    }

    if (name.length > maxNameLength) {
        return { error : 'Quiz name should be less than 30 characters' };
    }

    for (const quiz of data.quizzes) {
        if (quiz.ownerId === authUserId && quiz.name === name) {
            return { error : 'Quiz name already taken' };
        } 
    }

    currQuiz.name = name;

    setData(data);

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
export function adminQuizList(authUserId) {
    let data = getData();

    //check for valid authUserId
    if (typeof authUserId !== "number") {
        return { error: 'Invalid ID' };
    }

    //check authUserId exists
    let userFound = false;
    for (const user of data.users) {
        if (user.authUserId === authUserId) {
            userFound = true;
            break;
        }
    }
    if (userFound === false) {
        return { error: 'User ID not found' };
    }

    //creating list of user's quizzes to return
    let quizzes = [];
    for (const quiz of data.quizzes) {
        if (authUserId === quiz.ownerId) {
            quizzes.push({
                quizId: quiz.quizId,
                name: quiz.name,
            })
        }
    }
    return { quizzes };
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

    let unix_time = Math.floor(Date.now()/1000);

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
export function adminQuizRemove(authUserId, quizId) {

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
        return { error: 'invalid user ID' };
    }

    if (quizFlag) {
        return { error: 'invalid quiz ID' };
    }

    if (!currUser.userQuizzes.includes(quizId)) {
        return { error: 'you do not own this quiz' };
    }

    let i = 0;
    while (data.users[i].authUserId != authUserId) {
        i++;
    }
    let j = 0;
    while (data.users[i].userQuizzes[j] != quizId) {
        j++;
    }
    data.users[i].userQuizzes.splice(i, 1);

    i = 0;
    while(data.quizzes[i].quizId != quizId) {
        i++;
    }
    data.quizzes.splice(i, 1);
    setData(data);

    return {};
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
        name: currQuiz.name,
        timeCreated: currQuiz.timeCreated,
        timeLastEdited: currQuiz.timeLastEdited,
        description: currQuiz.description,
    }
}