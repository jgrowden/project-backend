import HTTPError from 'http-errors';
import { QuestionType } from './dataStore';
import {
  fetchUserFromSessionId,
  fetchQuizFromQuizId,
  fetchDeletedQuizFromQuizId,
  generateQuizSessionId
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
