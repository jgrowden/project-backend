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

export interface PlayerStatusReturn {
  state: string;
  numQuestions: number;
  atQuestion: number;
}

export function playerStatus(playerId: number): PlayerStatusReturn {
  const quizSession = fetchQuizSessionFromPlayerId(playerId);
  if (!quizSession) {
    throw HTTPError(400, 'PlayerId does not exist');
  }
  return {
    state: quizSession.state,
    numQuestions: quizSession.metadata.numQuestions,
    atQuestion: quizSession.atQuestion
  };
}

export function playerQuestionPosition(playerId: number, questionPosition: number): QuestionType {
  const quizSession = fetchQuizSessionFromPlayerId(playerId);
  if (!quizSession) {
    throw HTTPError(400, 'PlayerId does not exist');
  }
  if (questionPosition > quizSession.metadata.numQuestions) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }
  if (quizSession.atQuestion !== questionPosition) {
    throw HTTPError(400, 'Session is not currently on this question');
  }
  if (quizSession.state === 'LOBBY' || quizSession.state === 'QUESTION_COUNTDOWN' || quizSession.state === 'END') {
    throw HTTPError(400, 'Session is in LOBBY, QUESTION_COUNTDOWN, or END state');
  }
  return (quizSession.metadata.questions[questionPosition - 1]);
}

export function playerQuestionResults(playerId: number, questionPosition: number) {
  const quizSession = fetchQuizSessionFromPlayerId(playerId);
  if (!quizSession) {
    throw HTTPError(400, 'PlayerId does not exist');
  }
  if (questionPosition > quizSession.metadata.numQuestions) {
    throw HTTPError(400, 'Question position is not valid for the session this player is in');
  }
  if (quizSession.state !== 'ANSWER_SHOW') {
    throw HTTPError(400, 'Session is not in ANSWER_SHOW state');
  }
  if (quizSession.atQuestion < questionPosition) {
    throw HTTPError(400, 'Session is not yet up to this question');
  }

  

}