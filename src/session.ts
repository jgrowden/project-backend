import HTTPError from 'http-errors';
import {
  QuestionType,
  SessionAction,
  SessionState,
  getTimeoutData,
} from './dataStore';
import {
  fetchUserFromSessionId,
  fetchQuizFromQuizId,
  fetchDeletedQuizFromQuizId,
  generateQuizSessionId,
  fetchSessionFromSessionId,
  generateNewPlayerName,
  generateNewPlayerId,
  currentTime,
  updateState,
  getUsersRankedByScore,
  getQuestionResults,
  fetchQuizFromSessionId,
  writeResultsCSV
} from './helper';

export interface SessionIdType {
  sessionId: number;
}

interface playerIdType {
  playerId: number;
}
interface SessionViewType {
  activeSessions: number[];
  inactiveSessions: number[];
}

interface questionResultsType {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
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
    playerAnswers: []
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
  if (quizId !== fetchQuizFromSessionId(sessionId).quizId) {
    throw HTTPError(400, 'SessionId is not a session of this quiz');
  }

  if (!(action in SessionAction)) {
    throw HTTPError(400, 'Action is not a valid enum');
  }

  const newState = updateState(session.state as SessionState, action as SessionAction) as string;
  if (newState === undefined) {
    throw HTTPError(400, 'Action cannot be applied in current state');
  }

  session.state = newState as string;
  if (action === 'NEXT_QUESTION') {
    session.atQuestion++;
    session.playerAnswers.push({
      questionPosition: session.atQuestion,
      questionStartTime: currentTime(),
      answers: []
    });
    const timeoutId = setTimeout(() => {
      try {
        adminQuizSessionUpdate(token, quizId, sessionId, 'SKIP_COUNTDOWN');
        for (let i = 0; i < getTimeoutData().length; i++) {
          if (getTimeoutData()[i].sessionId === sessionId) {
            getTimeoutData().splice(i, 1);
            break;
          }
        }
      } catch (err) {
        console.error('error caught', 'SKIP_COUNTDOWN', err, getTimeoutData());
      }
    }, 3000);
    getTimeoutData().push({
      timeoutId: timeoutId,
      sessionId: sessionId
    });
  } else if (action === 'SKIP_COUNTDOWN') {
    for (const timer of getTimeoutData()) {
      if (timer.sessionId === sessionId) {
        clearTimeout(timer.timeoutId);
        getTimeoutData().splice(getTimeoutData().indexOf(timer));
      }
    }

    const timeoutId = setTimeout((sessionId) => {
      try {
        session.state = 'QUESTION_CLOSE';
        for (let i = 0; i < getTimeoutData().length; i++) {
          if (getTimeoutData()[i].sessionId === sessionId) {
            clearTimeout(getTimeoutData()[i].timeoutId);
            getTimeoutData().splice(i, 1);
            break;
          }
        }
      } catch (err) {
        console.log('error caught', err);
      }
    }, session.metadata.questions[session.atQuestion - 1].duration * 1000, sessionId);
    getTimeoutData().push({
      timeoutId: timeoutId,
      sessionId: sessionId
    });
  } else if (action === 'GO_TO_ANSWER') {
    for (const timer of getTimeoutData()) {
      if (timer.sessionId === sessionId) {
        clearTimeout(timer.timeoutId);
        getTimeoutData().splice(getTimeoutData().indexOf(timer));
      }
    }
  } else if (action === 'GO_TO_FINAL_RESULTS') {
    session.atQuestion = 0;
  } else if (action === 'END') {
    session.atQuestion = 0;
  }
  return {};
}

export function adminQuizSessionResultsCSV(token: string, quizId: number, sessionId: number): {url: string} {
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
  if (quizId !== fetchQuizFromSessionId(sessionId).quizId) {
    throw HTTPError(400, 'SessionId is not a session of this quiz');
  }
  if (session.state !== 'FINAL_RESULTS') {
    throw HTTPError(400, 'session is not in FINAL_RESULTS state');
  }

  return writeResultsCSV(sessionId);
}

/**
 * Retrieves information about a session, including state, the current question,
 * the players, and the quiz information
 */
export function adminQuizSessionInfo (token: string, quizId: number, sessionId: number) {
  const user = fetchUserFromSessionId(token);
  if (!user) {
    throw HTTPError(401, 'User not found');
  }

  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    throw HTTPError(403, 'Quiz not found');
  }

  if (user.authUserId !== quiz.ownerId) {
    throw HTTPError(403, 'User does not own this quiz');
  }

  for (const session of quiz.quizSessions) {
    if (session.quizSessionId === sessionId) {
      const metadata = JSON.parse(JSON.stringify(session.metadata));
      delete metadata.ownerId;
      delete metadata.quizSessions;
      return {
        state: session.state,
        atQuestion: session.atQuestion,
        players: session.players,
        metadata: metadata
      };
    }
  }

  throw HTTPError(400, 'Session not found');
}

/**
 * Retrieves active and inactive session ids (sorted in ascending order) for a quiz
 * Active sessions are sessions that are not in the END state
 * Inactive sessions are sessions in the END state
 * @param {string} token
 * @param {number} quizId
 * @returns {SessionViewType}
 */
export function adminQuizSessionsView(token: string, quizId: number): SessionViewType {
  const user = fetchUserFromSessionId(token);
  if (!user) {
    throw HTTPError(401, 'invalid token');
  }
  const quiz = fetchQuizFromQuizId(quizId);
  if (!quiz) {
    throw HTTPError(403, 'invalid quizId');
  }
  if (quiz.ownerId !== user.authUserId) {
    throw HTTPError(403, 'invalid quiz ownership');
  }

  const activeSessions = [];
  const inactiveSessions = [];
  for (const session of quiz.quizSessions) {
    if (session.state === 'END') {
      inactiveSessions.push(session.quizSessionId);
    } else {
      activeSessions.push(session.quizSessionId);
    }
  }
  return {
    activeSessions: activeSessions,
    inactiveSessions: inactiveSessions
  };
}

/**
 * Joins a new player to some quiz session in LOBBY state
 * @param {string} name
 * @param {number} sessionId
 * @returns {
*  playerId: number
* }
*/
export function playerQuizSessionJoin(
  sessionId: number,
  name: string
): playerIdType {
  const session = fetchSessionFromSessionId(sessionId);
  if (session === undefined) {
    throw HTTPError(400, 'Invalid sessionId');
  }
  if (session.state !== 'LOBBY') {
    throw HTTPError(400, 'Session is not in LOBBY state');
  }
  if (session.players.find(player => player.playerName === name) !== undefined) {
    throw HTTPError(400, 'Name of new player is not unique');
  }
  if (name === '') {
    name = generateNewPlayerName();
  }
  const newPlayerId = generateNewPlayerId(sessionId);
  session.players.push({ playerId: newPlayerId, playerName: name });
  return { playerId: newPlayerId };
}

export function adminQuizSessionFinalResults(token: string, quizId: number, sessionId: number) {
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
  if (quizId !== fetchQuizFromSessionId(sessionId).quizId) {
    throw HTTPError(400, 'SessionId is not a session of this quiz');
  }

  if (session.state !== 'FINAL_RESULTS') {
    throw HTTPError(400, 'Action is not in FINAL_RESULTS state');
  }

  const usersRankedByScore = getUsersRankedByScore(session);
  const questionResults: questionResultsType[] = [];
  let currentQuestion = 1;
  for (let i = 0; i < session.playerAnswers.length; i++) {
    questionResults.push(getQuestionResults(session, currentQuestion));
    currentQuestion++;
  }

  return {
    usersRankedByScore: usersRankedByScore,
    questionResults: questionResults
  };
}
