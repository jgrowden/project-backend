import HTTPError from 'http-errors';
import {
  QuestionType,
  SessionAction,
  SessionState,
  getTimeoutData
} from './dataStore';
import {
  fetchUserFromSessionId,
  fetchQuizFromQuizId,
  fetchDeletedQuizFromQuizId,
  generateQuizSessionId,
  fetchSessionFromSessionId,
  currentTime,
  updateState
} from './helper';

export interface SessionIdType {
  sessionId: number;
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
export function adminQuizSessionStart(token: string, quizId: number, autoStartNum: number): SessionIdType {
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
  quizCopy.questions = questionCopy;

  quiz.quizSessions.push({
    state: 'LOBBY',
    atQuestion: 0,
    players: [],
    quizSessionId: quizSessionId,
    autoStartNum: autoStartNum,
    messages: [],
    metadata: quizCopy,
    collectedAnswers: []
  });
  return {
    sessionId: quizSessionId,
  };
}

export function adminQuizSessionUpdate(
  token: string,
  quizId: number,
  sessionId: number,
  action: string
): Record<string, never> {
  const user = fetchUserFromSessionId(token);
  if (!user) {
    throw HTTPError(401, 'User not found');
  }
  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    throw HTTPError(403, 'Quiz not found');
  }
  if (quiz.ownerId !== user.authUserId) {
    throw HTTPError(403, 'User does not own quiz');
  }
  const session = fetchSessionFromSessionId(sessionId);
  if (!session) {
    throw HTTPError(400, 'Session not found');
  }
  if (session.quizSessionId !== sessionId) {
    throw HTTPError(400, 'SessionId is not a session of this quiz');
  }

  if (action !== 'NEXT_QUESTION') {
    throw HTTPError(400, 'Action is not a valid enum');
  }

  const newState = updateState(session.state as SessionState, action as SessionAction);
  if (!newState) {
    throw HTTPError(400, 'Action cannot be applied in current state');
  }

  session.state = newState as string;
  if (action === 'NEXT_QUESTION') {
    session.atQuestion++;
    session.collectedAnswers.push({
      playersCorrectList: [],
      averageAnswerTime: 0,
      questionPosition: session.atQuestion,
      percentCorrect: 0,
      playerAnswers: [],
      questionStartTime: currentTime()
    });
    const timeoutId = setTimeout(() => adminQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN'), 3000);
    getTimeoutData().push({
      timeoutId: timeoutId,
      sessionId: sessionId
    });
  } else if (action === 'SKIP_COUNTDOWN') {
    const timeoutData = getTimeoutData().find(data => data.sessionId === sessionId);
    clearTimeout(timeoutData.timeoutId);
    session.state = 'QUESTION_CLOSE';
    for (let i = 0; i < getTimeoutData().length; i++) {
      if (getTimeoutData()[i].sessionId === sessionId) {
        getTimeoutData().splice(i, 1);
        break;
      }
    }
  } else if (action === 'GO_TO_ANSWER') {
    // do nothing
  } else if (action === 'GO_TO_FINAL_RESULTS') {
    session.atQuestion = 0;
  } else if (action === 'END') {
    session.atQuestion = 0;
  }
  return {};
}
