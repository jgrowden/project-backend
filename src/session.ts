import HTTPError from 'http-errors';
import { 
  QuestionType,
  getData,
  SessionState
 } from './dataStore';
import {
  fetchUserFromSessionId,
  fetchQuizFromQuizId,
  fetchDeletedQuizFromQuizId,
  generateQuizSessionId,
  fetchSessionFromSessionId,
  generateNewPlayerId,
  generateNewPlayerName,
  currentTime
} from './helper';

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
  const user = fetchUserFromSessionId(token);
  if (!user) {
    throw HTTPError(401, 'invalid token');
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    const deletedQuiz = fetchDeletedQuizFromQuizId(quizId);
    if (deletedQuiz && deletedQuiz.ownerId === user.authUserId) {
      throw HTTPError(400, 'quiz is in trash');
    } else {
      throw HTTPError(403, 'invalid quizId');
    }
  }

  if (quiz.ownerId !== user.authUserId) {
    throw HTTPError(403, 'invalid quiz ownership');
  }
  if (autoStartNum > 50) {
    throw HTTPError(400, 'autoStartNum > 50');
  }

  const activeSessions = quiz.quizSessions.filter(session => session.state !== 'END');
  if (activeSessions.length >= 10) {
    throw HTTPError(400, 'maximum amount of active sessions reached');
  }
  if (quiz.questions.length === 0) {
    throw HTTPError(400, 'quiz has no questions');
  }

  // Copy quiz
  // Initialise extra question fields for use in session states
  const quizSessionId = generateQuizSessionId();
  const quizCopy = JSON.parse(JSON.stringify(quiz));

  // Define type of questions to avoid typescript errors in map
  const questionCopy: QuestionType[] = JSON.parse(JSON.stringify(quiz.questions));
  quizCopy.questions = questionCopy.map(question => {
    question.playersCorrectList = [];
    question.averageAnswerTime = 0;
    question.percentCorrect = 0;
    return question;
  });

  quiz.quizSessions.push({
    state: 'LOBBY',
    atQuestion: 0,
    players: [],
    quizSessionId: quizSessionId,
    autoStartNum: autoStartNum,
    messages: [],
    metadata: quizCopy
  });
  return {
    sessionId: quizSessionId,
  };
}

interface playerIdType {
  playerId: number;
};

/**
 * Joins a new player to some quiz session in LOBBY state
 * @param {string} name
 * @param {number} sessionId
 * @returns {
*  playerId: number
* }
*/
export function adminQuizSessionPlayerJoin(
  sessionId: number,
  name: string
): playerIdType {
  let session = fetchSessionFromSessionId(sessionId);
  if (session === undefined) {
    throw HTTPError(400, 'Invalid sessionId');
  }
  if (session.state !== 'LOBBY') {
    throw HTTPError(400, 'Session is not in LOBBY state');
  }
  if (session.players.find(player => player.playerName === name) !== undefined) {
    throw HTTPError(400, 'Name of new player is not unique');
  }
  if (name === '') {/* 
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789'; */
    name = generateNewPlayerName;
  }
  let newPlayerId = generateNewPlayerId(sessionId);
  session.players.push({ playerId: newPlayerId, playerName: name });
  return { playerId: newPlayerId };
}

export function adminQuizSessionPlayerAnswer(playerId: number, questionPosition: number, answerIds: number[]) {
  // fetch quiz session from player id 
  let quiz = getData().quizzes.find(quiz => quiz.quizSessions.some(session => session.players.some(player => player.playerId === playerId)));
  if (!quiz) throw HTTPError(400, 'Invalid player id');
  let session = quiz.quizSessions.some(session => session.players.some(player => player.playerId === playerId));
  if (session.metadata.questions.length < questionPosition || questionPosition < 1) throw HTTPError(400, 'Invalid quesiton number');
  if (session.state !== SessionState.QUESTIONS_OPEN) throw HTTPError(400, 'Session is not in QUESTIONS_OPEN state');
  if (answerIds.length <= 0) throw HTTPError(400, 'Less than 1 answerId submitted');
  let validAnswerIdFlag = true;
  let noDuplicateAnswerIdFlag = true;  
  for (const answerId of answerIds) {
    if (!session.metadata.questions[questionPosition].answers.some(answer => answer.answerId === answerId)) validAnswerIdFlag = false;
    if (answerIds.filter(someAnswerId => someAnswerId === answerId).length !== 1) noDuplicateAnswerIdFlag = false;
  }
  if (!validAnswerIdFlag) throw HTTPError(400, 'Invalid answer Id');
  if (!noDuplicateAnswerIdFlag) throw HTTPError(400, 'Duplicate answer Ids');

  // according to the specification, the $N$th person who got all the correct answers gets a score of P/N.
  let questionAnswers = session.playerAnswers.find(playerAnswer => playerAnswer.questionPosition === questionPosition);
  questionAnswers.answers.push({
    playerId: playerId,
    answerIds: answerIds,
    answerTime: currentTime()
  });

  return {};
}