import HTTPError from 'http-errors';
import {
  QuestionType,
} from './dataStore';
import {
  fetchQuizSessionFromPlayerId,
} from './helper';

export interface SessionIdType {
  sessionId: number;
}

export function playerQuestionPosition(playerId: number, questionPosition: number): QuestionType {
  const quizSession = fetchQuizSessionFromPlayerId(playerId);
  if (!quizSession) {
    throw HTTPError(400, 'PlayerId does not exist');
  }
  if (questionPosition > quizSession.metadata.numQuestions) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }
  if (quizSession.atQuestion !== questionPosition - 1) {
    throw HTTPError(400, 'Session is not currently on this question');
  }
  if (quizSession.state === 'LOBBY' || quizSession.state === 'QUESTION_COUNTDOWN' || quizSession.state === 'END') {
    throw HTTPError(400, 'Session is in LOBBY, QUESTION_COUNTDOWN, or END state');
  }
  return (quizSession.metadata.questions[questionPosition - 1]);
}
