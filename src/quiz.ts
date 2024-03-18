// import { string } from 'yaml/dist/schema/common/string';
import { getData } from './dataStore';
import { fetchUserFromSessionId, fetchQuizFromQuizId, generateNewQuizId, currentTime } from './helper';

interface ErrorObject {
  error: string
}

interface AdminQuizListReturnElement {
  quizId: number;
  name: string;
}

interface AdminQuizListReturn {
  quizzes: AdminQuizListReturnElement[];
}

interface AdminQuizCreateReturn {
  quizId: number;
}

interface AdminQuizInfoReturn {
  quizId: number;
  name: string;
  timeCreated: number;
  timeLastEdited: number;
  description: string;
}

const quizDescriptionMaxLength = 100;
const quizNameMinLength = 3;
const quizNameMaxLength = 30;
const regex = /[^A-Za-z0-9 ]/;

/**
 * Update the description of the relevant quiz.
 *
 * @param {string} sessionId - unique user identification number
 * @param {number} quizId - a quiz's unique identification number
 * @param {string} description - description of the quiz being created
 *
 * @returns {} - an empty object
*/
export function adminQuizDescriptionUpdate(sessionId: string, quizId: number, description: string): ErrorObject | Record<string, never> {
  const user = fetchUserFromSessionId(sessionId);
  const quiz = fetchQuizFromQuizId(quizId);

  if (!user) {
    return { error: 'User ID not found' };
  }

  if (!quiz) {
    return { error: 'Quiz ID not found' };
  }

  if (!user.userQuizzes.includes(quizId)) {
    return { error: 'Quiz not owned by user' };
  }

  if (description.length > quizDescriptionMaxLength) {
    return { error: 'Quiz description should be less than 100 characters' };
  }

  quiz.description = description;

  return {};
}

/**
 * Update the name of the relevant quiz.
 *
 * @param {string} sessionId - unique user identification number
 * @param {number} quizId - a quiz's unique identification number
 * @param {string} name - name of quiz created
 *
 * @returns {} - an empty object
*/
export function adminQuizNameUpdate(sessionId: string, quizId: number, name: string): ErrorObject | Record<string, never> {
  const data = getData();

  const user = fetchUserFromSessionId(sessionId);
  const quiz = fetchQuizFromQuizId(quizId);

  if (!user) {
    return { error: 'User ID not found' };
  }

  if (!quiz) {
    return { error: 'Quiz ID not found' };
  }

  if (!user.userQuizzes.includes(quizId)) {
    return { error: 'Quiz not owned by user' };
  }

  if (regex.test(name)) {
    return { error: 'Invalid characters found in quiz name' };
  }

  if (name.length < quizNameMinLength) {
    return { error: 'invalid quiz name length: too short' };
  }

  if (name.length > quizNameMaxLength) {
    return { error: 'invalid quiz name length: too long' };
  }

  if (data.quizzes.find(quiz => quiz.ownerId === user.authUserId && quiz.name === name)) {
    return { error: 'Quiz name already taken' };
  }

  quiz.name = name;

  return {};
}

/**
 * Provide a list of all quizzes that are owned by the currently logged in user.
 *
 * @param {string} sessionId - unique identifier for user
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
export function adminQuizList(sessionId: string): AdminQuizListReturn | ErrorObject {
  const data = getData();

  const user = fetchUserFromSessionId(sessionId);

  if (!user) {
    return { error: 'User ID not found' };
  }

  const filteredQuiz = data.quizzes.filter(quiz => quiz.ownerId === user.authUserId);
  const quizzes = filteredQuiz.map(quiz => { return { quizId: quiz.quizId, name: quiz.name }; });

  return { quizzes: quizzes };
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 *
 * @param {string} sessionId - unique user identification number
 * @param {string} name - name of quiz created
 * @param {string} description - description of the quiz being created
 *
 * @returns {quizId: 2} - object with a unique quiz identification number
*/

export function adminQuizCreate(sessionId: string, name: string, description: string): AdminQuizCreateReturn | ErrorObject {
  const data = getData();

  const user = fetchUserFromSessionId(sessionId);

  if (!user) {
    return { error: 'invalid user ID' };
  }

  if (regex.test(name)) {
    return { error: 'invalid quiz name characters' };
  }

  if (name.length < quizNameMinLength) {
    return { error: 'invalid quiz name length: too short' };
  }

  if (name.length > quizNameMaxLength) {
    return { error: 'invalid quiz name length: too long' };
  }

  const duplicateName = user.userQuizzes.find(quizId => fetchQuizFromQuizId(quizId).name === name);

  if (duplicateName !== undefined) {
    return { error: 'Duplicate quiz name' };
  }

  if (description.length > quizDescriptionMaxLength) {
    return { error: 'Quiz description invalid length' };
  }

  const unixTime = currentTime();

  // fetches new quizId that is the lowest unused quizId number
  const newQuizId = generateNewQuizId();

  user.userQuizzes.push(newQuizId);
  data.quizzes.push({
    ownerId: user.authUserId,
    quizId: newQuizId,
    name: name,
    description: description,
    timeCreated: unixTime,
    timeLastEdited: unixTime,
  });

  return { quizId: newQuizId };
}

/**
 * Given a particular quiz, permanently remove the quiz.
 *
 * @param {string} sessionId - a user's unique identification number
 * @param {number} quizId - a quiz's unique identification number
 *
 * @returns {} - an empty object
 */
export function adminQuizRemove(sessionId: string, quizId: number): ErrorObject | Record<string, never> {
  const data = getData();

  const user = fetchUserFromSessionId(sessionId);
  const quiz = fetchQuizFromQuizId(quizId);

  if (!user) {
    return { error: 'invalid user ID' };
  }

  if (!quiz) {
    return { error: 'invalid quiz ID' };
  }

  if (!user.userQuizzes.includes(quizId)) {
    return { error: 'you do not own this quiz' };
  }

  data.deletedQuizzes.push(fetchQuizFromQuizId(quizId));
  user.userQuizzes.splice(user.userQuizzes.indexOf(quizId), 1);
  data.quizzes.splice(data.quizzes.indexOf(quiz), 1);

  return {};
}

/**
 * Get all of the relevant information about the current quiz.
 *
 * @param {string} sessionId - a user's unique identification number
 * @param {number} quizId - a quiz's unique identification number
 *
 * @returns {
 *      quizId: number,
 *      name: string,
 *      timeCreated: number,
 *      timeLastEdited: number,
 *      description: string
 * } - returns an object with details about the quiz queried for information.
 */
export function adminQuizInfo(sessionId: string, quizId: number): AdminQuizInfoReturn | ErrorObject {
  const user = fetchUserFromSessionId(sessionId);
  const quiz = fetchQuizFromQuizId(quizId);

  if (!user) {
    return { error: 'invalid user ID' };
  }

  if (!quiz) {
    return { error: 'invalid quiz ID' };
  }

  if (!user.userQuizzes.includes(quizId)) {
    return { error: 'you do not own this quiz' };
  }

  return {
    quizId: quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
  };
}
