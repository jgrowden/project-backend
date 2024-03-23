import { AnswerType, getData, QuestionType, QuizType } from './dataStore';
import { fetchUserFromSessionId, fetchQuizFromQuizId, fetchQuestionFromQuestionId, generateNewQuizId, generateNewQuestionId, currentTime, returnError, ErrorObject, ErrorObjectWithCode } from './helper';

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

interface AdminQuizQuestionCreateReturn {
  questionId: number;
}

export interface adminQuizQuestionCreateArgument {
  question: string;
  duration: number;
  points: number;
  answers: AnswerType[];
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

export function adminQuizCreate(sessionId: string, name: string, description: string): AdminQuizCreateReturn | ErrorObjectWithCode {
  const data = getData();

  const user = fetchUserFromSessionId(sessionId);

  if (!user) {
    return returnError('invalid user ID', 401);
  }

  if (regex.test(name)) {
    return returnError('invalid quiz name characters', 400);
  }

  if (name.length < quizNameMinLength || name.length > quizNameMaxLength) {
    return returnError('invalid quiz name length', 400);
  }

  const duplicateName = user.userQuizzes.find(quizId => fetchQuizFromQuizId(quizId).name === name);

  if (duplicateName !== undefined) {
    return returnError('Duplicate quiz name', 400);
  }

  if (description.length > quizDescriptionMaxLength) {
    return returnError('Quiz description invalid length', 400);
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
    numQuestions: 0,
    questions: []
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
export function adminQuizRemove(sessionId: string, quizId: number): ErrorObjectWithCode | Record<string, never> {
  const data = getData();

  const user = fetchUserFromSessionId(sessionId);
  const quiz = fetchQuizFromQuizId(quizId);

  if (!user) {
    return returnError('invalid user ID', 401);
  }

  if (!quiz) {
    return returnError('invalid quiz ID', 403);
  }

  if (!user.userQuizzes.includes(quizId)) {
    return returnError('you do not own this quiz', 403);
  }

  data.deletedQuizzes.push(fetchQuizFromQuizId(quizId));
  user.userQuizzes.splice(user.userQuizzes.indexOf(quizId), 1);
  data.quizzes.splice(data.quizzes.indexOf(quiz), 1);

  return {};
}

export function adminQuizTrashList(sessionId: string): ErrorObjectWithCode | AdminQuizListReturn {
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
export function adminQuizInfo(sessionId: string, quizId: number): QuizType | ErrorObjectWithCode {
  const user = fetchUserFromSessionId(sessionId);
  const quiz = fetchQuizFromQuizId(quizId);

  if (!user) {
    return returnError('invalid user ID', 401);
  }

  if (!quiz) {
    return returnError('invalid quiz ID', 403);
  }

  if (!user.userQuizzes.includes(quizId)) {
    return returnError('you do not own this quiz', 403);
  }

  return quiz;
}

export function adminQuizQuestionCreate(
  sessionId: string,
  quizId: number,
  questionParameters: adminQuizQuestionCreateArgument
): AdminQuizQuestionCreateReturn | ErrorObjectWithCode {
  const user = fetchUserFromSessionId(sessionId);
  const quiz = fetchQuizFromQuizId(quizId);

  if (!user) {
    return returnError('invalid user ID', 401);
  }

  if (!quiz) {
    return returnError('invalid quiz ID', 403);
  }
  if (!user.userQuizzes.includes(quizId)) {
    return returnError('you do not own this quiz', 403);
  }

  if (questionParameters.question.length < 5 || questionParameters.question.length > 50) {
    return returnError('Question has invalid length: must be between 5 and 50 characters', 400);
  }

  if (questionParameters.answers.length < 2 || questionParameters.answers.length > 6) {
    return returnError('Invalid number of answers: there must be between 2 and 6 answers', 400);
  }

  if (questionParameters.duration < 1) {
    return returnError('Question must have positive duration', 400);
  }

  const questionLength = quiz.questions.reduce((pSum, question) => pSum + question.duration, 0);

  if (questionLength + questionParameters.duration > 180) {
    return returnError('Quiz must have duration lower than 180', 400);
  }

  if (questionParameters.points < 1 || questionParameters.points > 10) {
    return returnError('Invalid quiz point count: question must have between 1 and 10 points', 400);
  }

  if (questionParameters.answers.find(entry => entry.answer.length < 1 || entry.answer.length > 30) !== undefined) {
    return returnError('Invalid answer length: answers must be between 1 and 30 characters long', 400);
  }

  // check for duplicate entries
  const answer = questionParameters.answers.map(entry => entry.answer);
  const duplicates = answer.filter((entry, index) => answer.indexOf(entry) !== index);

  if (duplicates.length !== 0) {
    return returnError('Question cannot have duplicate answers', 400);
  }

  if (questionParameters.answers.find(answer => answer.correct === true) === undefined) {
    return returnError('There are no correct answers', 400);
  }

  const newQuestionId = generateNewQuestionId();

  quiz.questions.push({
    questionId: newQuestionId,
    question: questionParameters.question,
    duration: questionParameters.duration,
    points: questionParameters.points,
    answers: questionParameters.answers
  });
  quiz.numQuestions++;
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  return {
    questionId: newQuestionId
  };
}

/**
 * Update the relevant details of a particular question within a quiz.
 * When this route is called, the last edited time is updated,
 * and the colours of all answers of that question are randomly generated.
 * @param {string} sessionId
 * @param {number} quizId
 * @param {number} questionId
 * @param {AdminQuizQuestionBody} questionBody
 * @returns {} - empty object
 */
export function adminQuizQuestionUpdate(sessionId: string, quizId: number, questionId: number, newQuestionBody: QuestionType): ErrorObject | Record<string, never> {
  const user = fetchUserFromSessionId(sessionId);
  if (!user) {
    return {
      error: 'Invalid token',
      statusCode: 401,
    };
  }
  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    return {
      error: 'Invalid quizId',
      statusCode: 403,
    };
  }

  if (quiz.ownerId !== user.authUserId) {
    return {
      error: 'Invalid quiz ownership',
      statusCode: 403,
    };
  }

  const question = fetchQuestionFromQuestionId(quiz, questionId);
  if (!question) {
    return {
      error: 'Invalid questionId',
      statusCode: 400,
    };
  }

  const questionLength = newQuestionBody.question.length;
  if (questionLength < 5 || questionLength > 50) {
    return {
      error: 'Invalid question string',
      statusCode: 400,
    };
  }

  const answersArrayLength = newQuestionBody.answers.length;
  if (answersArrayLength < 2 || answersArrayLength > 6) {
    return {
      error: 'Invalid amount of answers',
      statusCode: 400,
    };
  }

  if (newQuestionBody.duration < 1) {
    return {
      error: 'Duration must be positive',
      statusCode: 400,
    };
  }

  const quizDuration = quiz.duration - question.duration;
  if (quizDuration + newQuestionBody.duration > 180) {
    return {
      error: 'Quiz duration must not exceed 3 mins',
      statusCode: 400,
    };
  }

  if (newQuestionBody.points < 1 || newQuestionBody.points > 10) {
    return {
      error: 'Question points must be between 1 and 10 (inclusive)',
      statusCode: 400,
    };
  }

  let noCorrectAnswers = true;
  let noDuplicateAnswers = true;
  let nextIndex = 1;
  for (const answerBody of newQuestionBody.answers) {
    const answerLength = answerBody.answer.length;
    if (answerLength < 1 || answerLength > 30) {
      return {
        error: 'Invalid answer string length',
        statusCode: 400,
      };
    }
    if (answerBody.correct === true) {
      noCorrectAnswers = false;
    }
    for (let i = nextIndex; i < newQuestionBody.answers.length; i++) {
      if (answerBody.answer === newQuestionBody.answers[i].answer) {
        noDuplicateAnswers = false;
      }
    }
    nextIndex++;
  }

  if (noCorrectAnswers) {
    return {
      error: 'Question must contain at least one correct answer',
      statusCode: 400,
    };
  }

  if (!noDuplicateAnswers) {
    return {
      error: 'Answer strings must be unique',
      statusCode: 400,
    };
  }

  // No errors, update question
  quiz.duration = quizDuration + newQuestionBody.duration;
  question.question = newQuestionBody.question;
  question.duration = newQuestionBody.duration;
  question.points = newQuestionBody.points;
  const newAnswerBodies = newQuestionBody.answers.map(answer => {
    answer.colour = setRandomColour();
    return answer;
  });
  question.answers = newAnswerBodies;
  quiz.timeLastEdited = ~~(Date.now() / 1000);

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
export function adminQuizQuestionMove(token: string, quizId: number, questionId: number, newPosition: number): ErrorObject | Record<string, never> {
  const user = fetchUserFromSessionId(token);
  if (!user) {
    return {
      error: 'Invalid token',
      statusCode: 401,
    };
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    return {
      error: 'Invalid quizId',
      statusCode: 403,
    };
  }

  if (quiz.ownerId !== user.authUserId) {
    return {
      error: 'Invalid quiz ownership',
      statusCode: 403,
    };
  }

  const question = fetchQuestionFromQuestionId(quiz, questionId);
  if (!question) {
    return {
      error: 'Invalid questionId',
      statusCode: 400,
    };
  }

  if (newPosition < 0 || newPosition >= (quiz.questions.length)) {
    return {
      error: 'Invalid new position',
      statusCode: 400,
    };
  }

  if (quiz.questions[newPosition].questionId === questionId) {
    return {
      error: 'Question is already in the new position',
      statusCode: 400,
    };
  }

  let oldPosition = 0;
  for (const question of quiz.questions) {
    if (question.questionId === questionId) {
      break;
    }
    oldPosition++;
  }

  const questionToMove = quiz.questions[oldPosition];
  quiz.questions.splice(oldPosition, 1);
  quiz.questions.splice(newPosition, 0, questionToMove);
  quiz.timeLastEdited = Math.floor(Date.now() / 1000);

  return {};
}

/**
 * Function returns random colour out of 6 colours
 * @returns string
 */
function setRandomColour (): string {
  const colours = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
  return colours[~~(Math.random() * colours.length)];
}
