import { getData, UserType, QuestionType, QuizType } from './dataStore';
import {
  fetchUserFromSessionId,
  fetchQuizFromQuizId,
  fetchDeletedQuizFromQuizId,
  fetchQuestionFromQuestionId,
  generateNewQuizId,
  userWithEmailExists,
  generateNewQuestionId,
  currentTime,
  returnError,
  ErrorObjectWithCode
} from './helper';

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
  numQuestions: number;
  questions: QuestionType[];
  duration: number;
}

interface AdminQuizQuestionCreateReturn {
  questionId: number;
}

interface AdminQuizQuestionDuplicateReturn {
  newQuestionId: number;
}

const quizDescriptionMaxLength = 100;
const quizNameMinLength = 3;
const quizNameMaxLength = 30;
const regex = /[^A-Za-z0-9 ]/;
const ANSWER_COLOURS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'brown'];
const INVALID_INDEX = -1;
const questionLenMin = 5;
const questionLenMax = 50;
const questionNumAnswersMin = 2;
const questionNumAnswersMax = 6;
const questionDurationMax = 180;
const questionPointsMin = 1;
const questionPointsMax = 10;
const answersLenMin = 1;
const answersLenMax = 30;

/**
 * Update the description of the relevant quiz.
 *
 * @param {string} sessionId - unique user identification string
 * @param {number} quizId - a quiz's unique identification number
 * @param {string} description - description of the quiz being created
 *
 * @returns {} - an empty object
*/
export function adminQuizDescriptionUpdate(sessionId: string, quizId: number, description: string): ErrorObjectWithCode | Record<string, never> {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('Invalid token', 401);
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    return returnError('Invalid quiz', 403);
  }

  if (quiz.ownerId !== user.authUserId) {
    return returnError('Invalid quiz ownership', 403);
  }

  if (description.length > quizDescriptionMaxLength) {
    return returnError('Quiz description should be less than 100 characters', 400);
  }

  quiz.description = description;
  quiz.timeLastEdited = currentTime();

  return {};
}

/**
 * Update the name of the relevant quiz.
 *
 * @param {string} sessionId - unique user identification string
 * @param {number} quizId - a quiz's unique identification number
 * @param {string} name - name of quiz created
 *
 * @returns {} - an empty object
*/
export function adminQuizNameUpdate(sessionId: string, quizId: number, name: string): ErrorObjectWithCode | Record<string, never> {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('Invalid token', 401);
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    return returnError('Invalid quiz', 403);
  }

  if (quiz.ownerId !== user.authUserId) {
    return returnError('Invalid quiz ownership', 403);
  }

  if (regex.test(name)) {
    return returnError('Invalid characters found in quiz name', 400);
  }

  if (name.length < quizNameMinLength || name.length > quizNameMaxLength) {
    return returnError('Invalid quiz name length', 400);
  }

  const data = getData();
  if (data.quizzes.find(quiz => quiz.ownerId === user.authUserId && quiz.name === name)) {
    return returnError('Quiz name already taken', 400);
  }

  quiz.name = name;
  quiz.timeLastEdited = currentTime();

  return {};
}

/**
 * Restore a quiz from trash.
 *
 * @param {string} sessionId - unique user identification string
 * @param {number} quizId - a quiz's unique identification number
 *
 * @returns {} - an empty object
*/
export function adminQuizRestore(sessionId: string, quizId: number): ErrorObjectWithCode | Record<string, never> {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('Invalid token', 401);
  }

  const deletedQuiz = fetchDeletedQuizFromQuizId(quizId);
  if (!deletedQuiz) {
    return returnError('Invalid quiz', 403);
  }

  if (deletedQuiz.ownerId !== user.authUserId) {
    return returnError('Invalid quiz ownership', 403);
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (quiz) {
    return returnError('Quiz not in trash', 400);
  }

  const data = getData();
  if (data.quizzes.find(quiz => quiz.ownerId === user.authUserId && quiz.name === deletedQuiz.name)) {
    return returnError('Quiz name already taken', 400);
  }

  data.deletedQuizzes.splice(data.deletedQuizzes.indexOf(deletedQuiz), 1);

  data.quizzes.push(deletedQuiz);

  user.userQuizzes.push(quizId);

  deletedQuiz.timeLastEdited = currentTime();

  return {};
}

/**
 * Permanently delete specific quizzes currently sitting in the trash
 *
 * @param {string} sessionId - unique user identification string
 * @param {number[]} quizIds - array of quiz IDs to be permanently deleted
 *
 * @returns {} - an empty object
*/
export function adminQuizTrashEmpty(sessionId: string, quizIds: number[]): ErrorObjectWithCode | Record<string, never> {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('Invalid token', 401);
  }

  const data = getData();
  const deletedQuizzes = data.deletedQuizzes;

  for (const quizId of quizIds) {
    const quiz = deletedQuizzes.find(quiz => quiz.quizId === quizId);
    if (quiz && quiz.ownerId !== user.authUserId) {
      return returnError('Invalid quiz ownership', 403);
    }
  }

  const nonTrashedQuizIds = quizIds.filter(quizId => !deletedQuizzes.some(quiz => quiz.quizId === quizId));
  if (nonTrashedQuizIds.length > 0) {
    return returnError('One or more quizzes not in the trash', 400);
  }

  data.deletedQuizzes = deletedQuizzes.filter(quiz => !quizIds.includes(quiz.quizId));

  return {};
}

// Everything below has been migrated over to the server

/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////
/// /////////////////////////////////////////////////////////////////////////////

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
export function adminQuizList(sessionId: string): AdminQuizListReturn | ErrorObjectWithCode {
  const user = fetchUserFromSessionId(sessionId);

  if (!user) {
    return returnError('User ID not found', 401);
  }

  const userQuizzes = user.userQuizzes.map(quizId => fetchQuizFromQuizId(quizId));
  const returnQuizzes = userQuizzes.map(quiz => { return { quizId: quiz.quizId, name: quiz.name }; });
  return { quizzes: returnQuizzes };
}

/**
 * Given basic details about a new quiz, create one for the logged in user.
 *
 * @param {string} sessionId - unique user identification string
 * @param {string} name - name of quiz created
 * @param {string} description - description of the quiz being created
 *
 * @returns {quizId: 2} - object with a unique quiz identification number
*/

export function adminQuizCreate(
  sessionId: string,
  name: string,
  description: string
): AdminQuizCreateReturn | ErrorObjectWithCode {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('invalid user ID', 401);
  }

  if (regex.test(name)) {
    return returnError('invalid quiz name characters');
  }

  if (name.length < quizNameMinLength || name.length > quizNameMaxLength) {
    return returnError('invalid quiz name length');
  }

  // finds a duplicate name by finding an element with two distinct entries
  const duplicateName = user.userQuizzes.find(quizId => fetchQuizFromQuizId(quizId).name === name);

  if (duplicateName !== undefined) {
    return returnError('Duplicate quiz name');
  }

  if (description.length > quizDescriptionMaxLength) {
    return returnError('Quiz description invalid length');
  }

  const unixTime = currentTime();
  const newQuizId = generateNewQuizId();

  user.userQuizzes.push(newQuizId);

  getData().quizzes.push({
    ownerId: user.authUserId,
    quizId: newQuizId,
    name: name,
    description: description,
    timeCreated: unixTime,
    timeLastEdited: unixTime,
    numQuestions: 0,
    questions: [],
    duration: 0
  });

  return { quizId: newQuizId };
}

/**
 * Given a particular quiz, permanently remove the quiz.
 *
 * @param {string} sessionId - a user's unique identification string
 * @param {number} quizId - a quiz's unique identification number
 *
 * @returns {} - an empty object
 */
export function adminQuizRemove(
  sessionId: string,
  quizId: number
): ErrorObjectWithCode | Record<string, never> {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('invalid user ID', 401);
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    return returnError('invalid quiz ID', 403);
  }

  if (!user.userQuizzes.includes(quizId)) {
    return returnError('you do not own this quiz', 403);
  }

  const data = getData();
  data.deletedQuizzes.push(fetchQuizFromQuizId(quizId));
  user.userQuizzes.splice(user.userQuizzes.indexOf(quizId), 1);
  data.quizzes.splice(data.quizzes.indexOf(quiz), 1);

  return {};
}

/**
 * Returns a list with details of a user's deleted quizzes
 *
 * @param {string} sessionId
 *
 * @returns {{
*    quizzes: [
*       {
*          quizId: number,
*          name: string
*       }
*    ]
* }} - object with list of all quizzes by their unique ID number and name.
 */
export function adminQuizTrashList(
  sessionId: string
): ErrorObjectWithCode | AdminQuizListReturn {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError("invalid user ID'", 401);
  }

  const data = getData();
  const userDeletedQuizzes = data.deletedQuizzes.filter(quiz => quiz.ownerId === user.authUserId);
  const trashedQuizList = userDeletedQuizzes.map(quiz => { return { quizId: quiz.quizId, name: quiz.name }; });

  return { quizzes: trashedQuizList };
}

/**
 * Get all of the relevant information about the current quiz.
 *
 * @param {string} sessionId - a user's unique identification string
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
export function adminQuizInfo(
  sessionId: string,
  quizId: number
): AdminQuizInfoReturn | ErrorObjectWithCode {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('invalid user ID', 401);
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    return returnError('invalid quiz ID', 403);
  }

  if (!user.userQuizzes.includes(quizId)) {
    return returnError('you do not own this quiz', 403);
  }

  return {
    quizId: quiz.quizId,
    name: quiz.name,
    timeCreated: quiz.timeCreated,
    timeLastEdited: quiz.timeLastEdited,
    description: quiz.description,
    numQuestions: quiz.numQuestions,
    questions: quiz.questions,
    duration: quiz.duration
  };
}

/**
 * Adds a new question to the quiz provided by quizId and sessionId
 *
 * @param {string} sessionId - unique user identification string
 * @param {number} quizId - a quiz's unique identification number
 * @param {QuestionType} questionBody - the question to be added
 *
 * @returns {questionId} - a unique number to identify the question
*/
export function adminQuizQuestionCreate(
  sessionId: string,
  quizId: number,
  questionBody: QuestionType
): AdminQuizQuestionCreateReturn | ErrorObjectWithCode {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('invalid user ID', 401);
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    return returnError('invalid quiz ID', 403);
  }

  if (!user.userQuizzes.includes(quizId)) {
    return returnError('you do not own this quiz', 403);
  }

  if (questionBody.question.length < questionLenMin || questionBody.question.length > questionLenMax) {
    return returnError('Question must be between 5 and 50 characters long');
  }

  if (questionBody.answers.length < questionNumAnswersMin || questionBody.answers.length > questionNumAnswersMax) {
    return returnError('Invalid number of answers: there must be between 2 and 6 answers');
  }

  if (questionBody.duration <= 0) {
    return returnError('Question must have positive duration');
  }

  const questionLength = quiz.questions.reduce((pSum, question) => pSum + question.duration, 0);

  if (questionLength + questionBody.duration > questionDurationMax) {
    return returnError('Quiz must have duration lower than 180');
  }

  if (questionBody.points < questionPointsMin || questionBody.points > questionPointsMax) {
    return returnError('Invalid quiz point count: question must have between 1 and 10 points');
  }

  if (questionBody.answers.find(entry => entry.answer.length < answersLenMin || entry.answer.length > answersLenMax) !== undefined) {
    return returnError('Invalid answer length: answers must be between 1 and 30 characters long');
  }

  // check for duplicate entries
  const answer = questionBody.answers.map(entry => entry.answer);
  const duplicates = answer.filter((entry, index) => answer.indexOf(entry) !== index);

  if (duplicates.length !== 0) {
    return returnError('Question cannot have duplicate answers');
  }

  if (questionBody.answers.find(answer => answer.correct === true) === undefined) {
    return returnError('There are no correct answers');
  }

  const newQuestionId = generateNewQuestionId();
  const colours = [...ANSWER_COLOURS];
  questionBody.answers = questionBody.answers.map(answer => {
    answer.colour = setRandomColour(colours);
    answer.answerId = setAnswerId();
    return answer;
  });
  quiz.questions.push({
    questionId: newQuestionId,
    question: questionBody.question,
    duration: questionBody.duration,
    points: questionBody.points,
    answers: questionBody.answers
  });
  quiz.numQuestions++;
  quiz.duration += questionBody.duration;
  quiz.timeLastEdited = currentTime();

  return {
    questionId: newQuestionId
  };
}

export function adminQuizChangeOwner(
  sessionId: string,
  quizId: number,
  userEmail: string
): Record<string, never> | ErrorObjectWithCode {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('invalid user ID', 401);
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    return returnError('invalid quiz ID', 403);
  }

  if (!user.userQuizzes.includes(quizId)) {
    return returnError('you do not own this quiz', 403);
  }

  if (fetchUserFromSessionId(sessionId).email === userEmail) {
    return returnError('Email provided is the same as the logged in user');
  }

  const userWithEmailExist = userWithEmailExists(userEmail);
  if (!userWithEmailExist) {
    return returnError('User email does not exist');
  }

  const quizNames = userWithEmailExist.userQuizzes.map(quizIds => fetchQuizFromQuizId(quizIds).name);
  if (quizNames.indexOf(fetchQuizFromQuizId(quizId).name) !== -1) {
    return returnError('Quiz name is a duplicate of a quiz the other user currently owns');
  }

  quiz.ownerId = userWithEmailExist.authUserId;
  user.userQuizzes.splice(user.userQuizzes.indexOf(quizId), 1);
  userWithEmailExist.userQuizzes.push(quizId);

  return {};
}

/**
 * Update the relevant details of a particular question within a quiz.
 * When this route is called, the last edited time is updated,
 * and the colours of all answers of that question are randomly generated.
 * @param {string} sessionId
 * @param {number} quizId
 * @param {number} questionId
 * @param {AdminQuizQuestionBody} questionBody
 * @returns {} - empty object | ErrorObject
 */
export function adminQuizQuestionUpdate(
  sessionId: string,
  quizId: number,
  questionId: number,
  newQuestionBody: QuestionType
): ErrorObjectWithCode | Record<string, never> {
  const user: UserType | undefined = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('Invalid token', 401);
  }

  const quiz: QuizType | undefined = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    return returnError('Invalid quizId', 403);
  }

  if (quiz.ownerId !== user.authUserId) {
    return returnError('Invalid quiz ownership', 403);
  }

  const question: QuestionType | undefined = fetchQuestionFromQuestionId(quiz, questionId);
  if (!question) {
    return returnError('Invalid questionId');
  }

  const questionLength = newQuestionBody.question.length;
  if (questionLength < questionLenMin || questionLength > questionLenMax) {
    return returnError('Invalid question string');
  }

  const answersArrayLength = newQuestionBody.answers.length;
  if (answersArrayLength < questionNumAnswersMin || answersArrayLength > questionNumAnswersMax) {
    return returnError('Invalid amount of answers');
  }

  if (newQuestionBody.duration <= 0) {
    return returnError('Duration must be positive');
  }

  if (quiz.duration - question.duration + newQuestionBody.duration > questionDurationMax) {
    return returnError('Quiz duration must not exceed 3 mins');
  }

  if (newQuestionBody.points < questionPointsMin || newQuestionBody.points > questionPointsMax) {
    return returnError('Question points must be between 1 and 10 (inclusive)');
  }

  const invalidAnswer = newQuestionBody.answers.some(entry => entry.answer.length < answersLenMin ||
    entry.answer.length > answersLenMax);
  if (invalidAnswer) {
    return returnError('Invalid answer string length');
  }

  // check for duplicate entries
  const answer = newQuestionBody.answers.map(entry => entry.answer);
  const duplicates = answer.filter((entry, index) => answer.indexOf(entry) !== index);

  if (duplicates.length !== 0) {
    return returnError('Question cannot have duplicate answers');
  }

  if (!newQuestionBody.answers.some(answer => answer.correct === true)) {
    return returnError('There are no correct answers');
  }

  // No errors, update question
  quiz.duration += newQuestionBody.duration - question.duration;
  question.question = newQuestionBody.question;
  question.duration = newQuestionBody.duration;
  question.points = newQuestionBody.points;

  const colours = [...ANSWER_COLOURS];
  const newAnswerBodies = newQuestionBody.answers.map(answer => {
    answer.colour = setRandomColour(colours);
    answer.answerId = setAnswerId();
    return answer;
  });
  question.answers = newAnswerBodies;
  quiz.timeLastEdited = currentTime();

  return {};
}

/**
 * Moves a question from one particular position in the quiz to another
 * When this route is called, the timeLastEdited is updated
 * @param {string} token
 * @param {number} quizId
 * @param {number} questionId
 * @param {number} newPosition
 * @returns {} - empty object
 */
export function adminQuizQuestionMove(
  token: string,
  quizId: number,
  questionId: number,
  newPosition: number
): ErrorObjectWithCode | Record<string, never> {
  const user = fetchUserFromSessionId(token);
  if (!user) {
    return returnError('Invalid token', 401);
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    return returnError('Invalid quizId', 403);
  }

  if (quiz.ownerId !== user.authUserId) {
    return returnError('Invalid quiz ownership', 403);
  }

  const question = fetchQuestionFromQuestionId(quiz, questionId);
  if (!question) {
    return returnError('Invalid questionId');
  }

  if (newPosition < 0 || newPosition >= (quiz.questions.length)) {
    return returnError('Invalid new position');
  }

  if (quiz.questions[newPosition].questionId === questionId) {
    return returnError('Question is already in the new position');
  }

  const oldElement = quiz.questions.find(question => question.questionId === questionId);
  const oldPosition = quiz.questions.indexOf(oldElement);

  quiz.questions.splice(oldPosition, 1);
  quiz.questions.splice(newPosition, 0, oldElement);
  quiz.timeLastEdited = currentTime();

  return {};
}

/**
 * A particular question gets duplicated to immediately after where the source question is
 * When this route is called, the timeLastEdited is updated
 * @param {string} token
 * @param {number} quizId
 * @param {number} questionId
 * @returns {newQuestionId: number} - object containing question Id of duplicated quiz.
 */
export function adminQuizQuestionDuplicate(
  token: string,
  quizId: number,
  questionId: number
): ErrorObjectWithCode | AdminQuizQuestionDuplicateReturn {
  const user = fetchUserFromSessionId(token);
  if (!user) {
    return returnError('Invalid token', 401);
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    return returnError('Invalid quizId', 403);
  }

  if (quiz.ownerId !== user.authUserId) {
    return returnError('Invalid quiz ownership', 403);
  }

  const question = fetchQuestionFromQuestionId(quiz, questionId);
  if (!question) {
    return returnError('Invalid questionId');
  }

  const oldElement = quiz.questions.find(question => question.questionId === questionId);
  const oldPosition = quiz.questions.indexOf(oldElement);

  const newQuestion: QuestionType = {
    questionId: generateNewQuestionId(),
    question: question.question,
    duration: question.duration,
    points: question.points,
    answers: question.answers
  };

  quiz.questions.splice(oldPosition + 1, 0, newQuestion);
  quiz.numQuestions = quiz.questions.length;
  quiz.duration += newQuestion.duration;
  quiz.timeLastEdited = currentTime();

  return { newQuestionId: newQuestion.questionId };
}

/**
 * Delete a particular question from a quiz
 * @param {string} sessionId
 * @param {number} quizId
 * @param {number} questionId
 * @returns {} - empty object | ErrorObject
 * @returns
 */
export function adminQuizQuestionDelete(
  sessionId: string,
  quizId: number,
  questionId: number
): ErrorObjectWithCode | Record<string, never> {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return returnError('Invalid token', 401);
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    return returnError('Invalid quizId', 403);
  }

  if (quiz.ownerId !== user.authUserId) {
    return returnError('Invalid quiz ownership', 403);
  }

  const questionIndex = quiz.questions.findIndex(question => question.questionId === questionId);
  if (questionIndex === INVALID_INDEX) {
    return returnError('Invalid questionId');
  }

  // No errors, delete question from quiz
  // No requirement in spec to change lastEdited, but will do anyway
  quiz.numQuestions--;
  quiz.duration -= quiz.questions[questionIndex].duration;
  quiz.questions.splice(questionIndex, 1);
  quiz.timeLastEdited = currentTime();

  return {};
}

/**
 * Start a new session for a quiz
 * This copies the quiz, so that any edits whilst a session is running
 * do not affect active session
 * @param {string} token
 * @param {number} quizId
 * @param {number} autoStartNum
 * @returns {
 *  sessionId: number
 * }
 */
export function adminQuizSessionStart(token: string, quizId: number, autoStartNum: number) {
  return {
    sessionId: 0,
  };
}

/**
 * Function returns random colour from an array of colours
 * Pops the returned element from original array
 * @returns string
 */
const setRandomColour = (colours: string[]): string => {
  const colourIndex = ~~(Math.random() * colours.length);
  const colourToReturn = colours[colourIndex];
  colours.splice(colourIndex, 1);
  return colourToReturn;
};

/**
 * Basic ID generation function
 * Maximum of 6 answer Id's per question
 * Collision highly unlikely
 * @returns {number}
 */
const setAnswerId = (): number => {
  return ~~(Math.random() * 1000);
};
