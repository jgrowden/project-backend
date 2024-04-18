import HTTPError from 'http-errors';
import {
  QuestionType,
  getData,
} from './dataStore';
import {
  currentTime,
  fetchQuizSessionFromPlayerId,
  getUsersRankedByScore,
  getQuestionResults,
} from './helper';

export interface SessionIdType {
  sessionId: number;
}

export interface PlayerStatusReturn {
  state: string;
  numQuestions: number;
  atQuestion: number;
}

interface questionResultsType {
  questionId: number;
  playersCorrectList: string[];
  averageAnswerTime: number;
  percentCorrect: number;
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

export function playerQuestionAnswer(playerId: number, questionPosition: number, answerIds: number[]) {
  // fetch quiz session from player id
  const quiz = getData().quizzes.find(quiz => quiz.quizSessions.some(session => session.players.some(player => player.playerId === playerId)));
  if (!quiz) {
    throw HTTPError(400, 'Invalid player id');
  }

  const session = quiz.quizSessions.find(session => session.players.some(player => player.playerId === playerId));
  if (session.metadata.questions.length < questionPosition || questionPosition < 1) {
    throw HTTPError(400, 'Invalid quesiton number');
  }
  if (session.state !== 'QUESTION_OPEN') {
    throw HTTPError(400, 'Session is not in QUESTIONS_OPEN state');
  }
  if (answerIds.length <= 0) {
    throw HTTPError(400, 'Less than 1 answerId submitted');
  }

  let validAnswerIdFlag = true;
  let noDuplicateAnswerIdFlag = true;
  for (const answerId of answerIds) {
    if (!session.metadata.questions[questionPosition - 1].answers.some(answer => answer.answerId === answerId)) {
      validAnswerIdFlag = false;
    }
    if (answerIds.filter(someAnswerId => someAnswerId === answerId).length !== 1) {
      noDuplicateAnswerIdFlag = false;
    }
  }
  if (!validAnswerIdFlag) {
    throw HTTPError(400, 'Invalid answer Id');
  }
  if (!noDuplicateAnswerIdFlag) {
    throw HTTPError(400, 'Duplicate answer Ids');
  }

  // according to the specification, the $N$th person who got all the correct answers gets a score of P/N.
  const questionAnswers = session.playerAnswers.find(playerAnswer => playerAnswer.questionPosition === questionPosition);
  questionAnswers.answers.push({
    playerId: playerId,
    answerIds: answerIds,
    answerTime: currentTime()
  });

  return {};
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

  return getQuestionResults(quizSession, questionPosition);
}

export function playerSessionResults(playerId: number) {
  const quizSession = fetchQuizSessionFromPlayerId(playerId);
  if (!quizSession) {
    throw HTTPError(400, 'PlayerId does not exist');
  }
  if (quizSession.state !== 'FINAL_RESULTS') {
    throw HTTPError(400, 'Session is not in FINAL_RESULTS state');
  }

  const usersRankedByScore = getUsersRankedByScore(quizSession);
  const questionResults: questionResultsType[] = [];
  let currentQuestion = 1;
  for (let i = 0; i < quizSession.playerAnswers.length; i++) {
    questionResults.push(getQuestionResults(quizSession, currentQuestion));
    currentQuestion++;
  }

  return {
    usersRankedByScore: usersRankedByScore,
    questionResults: questionResults
  };
}
