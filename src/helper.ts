import {
  getData,
  UserType,
  QuizType,
  QuestionType,
  SessionState,
  QuizSessionType,
  SessionAction
} from './dataStore';

export interface ErrorObject {
  error: string;
  statusCode?: number;
}

export interface ErrorObjectWithCode {
  errorObject: ErrorObject;
  errorCode: number;
}

export interface ErrorString {
  error: string
}

export const fetchUserFromSessionId = (sessionId: string): UserType | undefined => {
  return getData().users.find(user => user.sessions.some(session => session === sessionId));
};

export const fetchQuizFromQuizId = (quizId: number): QuizType | undefined => {
  return getData().quizzes.find(quiz => quiz.quizId === quizId);
};

export const fetchDeletedQuizFromQuizId = (quizId: number): QuizType | undefined => {
  return getData().deletedQuizzes.find(quiz => quiz.quizId === quizId);
};

export const fetchQuestionFromQuestionId = (quiz: QuizType, questionId: number): QuestionType | undefined => {
  return quiz.questions.find(question => question.questionId === questionId);
};
export const userWithEmailExists = (email: string): UserType | undefined => {
  return getData().users.find(user => user.email === email);
};

export const fetchSessionFromSessionId = (sessionId: number): QuizSessionType | undefined => {
  const quiz = getData().quizzes.find(quiz => quiz.quizSessions.some(session => session.quizSessionId === sessionId));
  if (quiz === undefined) return undefined;
  const session = quiz.quizSessions.find(quizSession => quizSession.quizSessionId === sessionId);
  return session;
};

// generates psudorandom numbers, max 524287 unique Ids
const hash = (i: number): number => {
  return ((((54787 * i) % 524287) + 524287) % 524287);
};

export const generateNewUserId = (): number => {
  const data = getData();
  let newUserId = 2353;
  const userIds = data.users.map(user => user.authUserId);
  while (userIds.includes(newUserId)) newUserId = hash(newUserId);
  return newUserId;
};

export const generateNewQuizId = (): number => {
  const data = getData();
  let newQuizId = 2354;
  const quizIds = data.quizzes.map(quiz => quiz.quizId);
  while (quizIds.includes(newQuizId)) newQuizId = hash(newQuizId);
  return newQuizId;
};

export const generateNewPlayerId = (sessionId: number): number => {
  const session = fetchSessionFromSessionId(sessionId);
  const playerIds = session.players.map(player => player.playerId);
  let newPlayerId = 2355;
  while (playerIds.includes(newPlayerId)) newPlayerId = hash(newPlayerId);
  return newPlayerId;
};

export const generateNewPlayerName = (): string => {
  const letters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const playerName: string[] = [];
  let char;
  for (let i = 0; i < 5; i++) {
    char = letters.charAt(Math.floor(Math.random() * letters.length));
    if (!(playerName.includes(char))) {
      playerName.push(char);
    }
  }
  for (let i = 0; i < 3; i++) {
    char = numbers.charAt(Math.floor(Math.random() * numbers.length));
    if (!(playerName.includes(char))) {
      playerName.push(char);
    }
  }
  return playerName.join('');
};

export const currentTime = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const returnError = (errorString: string, errorCode?: number): ErrorObjectWithCode => {
  const err: ErrorString = { error: errorString };
  if (errorCode === undefined) {
    errorCode = 400;
  }
  return {
    errorObject: err,
    errorCode: errorCode
  };
};

export const generateNewQuestionId = (): number => {
  const data = getData();
  let newQuestionId = 2356;
  const QuestionIds = [];
  for (const quiz of data.quizzes) {
    for (const question of quiz.questions) {
      QuestionIds.push(question.questionId);
    }
  }
  while (QuestionIds.includes(newQuestionId)) {
    newQuestionId = hash(newQuestionId);
  }
  return newQuestionId;
};

export const generateQuizSessionId = (): number => {
  const data = getData();
  let newQuizSessionId = 2357;
  const quizSessionIds = [];
  for (const quiz of data.quizzes) {
    for (const quizSession of quiz.quizSessions) {
      quizSessionIds.push(quizSession.quizSessionId);
    }
  }
  while (quizSessionIds.includes(newQuizSessionId)) {
    newQuizSessionId = hash(newQuizSessionId);
  }
  return newQuizSessionId;
};

export const updateState = (state: SessionState, action: SessionAction): SessionState | undefined => {
  if (state === SessionState.LOBBY) {
    if (action === SessionAction.NEXT_QUESTION) {
      return SessionState.QUESTION_COUNTDOWN;
    } else if (action === SessionAction.END) {
      return SessionState.END;
    }
  } else if (state === SessionState.QUESTION_COUNTDOWN) {
    if (action === SessionAction.SKIP_COUNTDOWN) {
      return SessionState.QUESTION_OPEN;
    } else if (action === SessionAction.END) {
      return SessionState.END;
    }
  } else if (state === SessionState.QUESTION_OPEN) {
    if (action === SessionAction.GO_TO_ANSWER) {
      return SessionState.ANSWER_SHOW;
    } else if (action === SessionAction.END) {
      return SessionState.END;
    }
  } else if (state === SessionState.QUESTION_CLOSE) {
    if (action === SessionAction.NEXT_QUESTION) {
      return SessionState.QUESTION_COUNTDOWN;
    } else if (action === SessionAction.GO_TO_ANSWER) {
      return SessionState.ANSWER_SHOW;
    } else if (action === SessionAction.GO_TO_FINAL_RESULTS) {
      return SessionState.FINAL_RESULTS;
    } else if (action === SessionAction.END) {
      return SessionState.END;
    }
  } else if (state === SessionState.ANSWER_SHOW) {
    if (action === SessionAction.NEXT_QUESTION) {
      return SessionState.QUESTION_COUNTDOWN;
    } else if (action === SessionAction.GO_TO_FINAL_RESULTS) {
      return SessionState.FINAL_RESULTS;
    } else if (action === SessionAction.END) {
      return SessionState.END;
    }
  } else if (state === SessionState.FINAL_RESULTS) {
    if (action === SessionAction.END) {
      return SessionState.END;
    }
  } else if (state === SessionState.END) {
    // do nothing;
  }
  return undefined;
};

/**
 * Function returns random colour from an array of colours
 * Pops the returned element from original array
 * @returns string
 */
export const setRandomColour = (colours: string[]): string => {
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
export const setAnswerId = (): number => {
  return ~~(Math.random() * 1000);
};

export const isValidThumbnail = (thumbnail: string) => {
  if (!/\.(jpg|jpeg|png)$/i.test(thumbnail) || !/^https?:\/\//.test(thumbnail)) {
    return false;
  }
  return true;
};
