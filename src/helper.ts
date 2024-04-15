import {
  getData,
  UserType,
  QuizType,
  QuestionType,
  SessionState,
  QuizSessionType,
  SessionAction,
  QuestionPlayerAnswersType
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

export const fetchQuizSessionFromPlayerId = (playerId: number): QuizSessionType | undefined => {
  const quiz = getData().quizzes.find(quiz => quiz.quizSessions.some(session => session.players.some(player => player.playerId === playerId)));
  if (quiz === undefined) return undefined;
  const session = quiz.quizSessions.find(session => session.players.some(player => player.playerId === playerId));
  if (session === undefined) return undefined;
  return session;
};

// generates psudorandom numbers, max 524287 unique Ids
export const hash = (i: number): number => {
  return ((((524287 * i) % 39916801) + 39916801) % 39916801);
};

const newId = (): number => {
  const newUserId = hash(getData().id);
  getData().id++;
  return newUserId;
};

export const generateNewUserId = (): number => {
  return newId();
};

export const generateNewQuizId = (): number => {
  return newId();
};

export const generateNewPlayerId = (sessionId: number): number => {
  return newId();
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
  return newId();
};

export const generateQuizSessionId = (): number => {
  return newId();
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
  return newId();
};

export const isValidThumbnail = (thumbnail: string) => {
  if (!/\.(jpg|jpeg|png)$/i.test(thumbnail) || !/^https?:\/\//.test(thumbnail)) {
    return false;
  }
  return true;
};

export const calculateQuestionAverageAnswerTime = (playerAnswers: QuestionPlayerAnswersType) => {
  let totalTimeTaken = 0;
  let numAnswers = 0;

  for (const answer of playerAnswers.answers) {
    totalTimeTaken += (answer.answerTime - playerAnswers.questionStartTime);
    numAnswers++;
  }

  let averageTime: number;
  if (numAnswers === 0) {
    averageTime = 0;
  } else {
    averageTime = Math.floor(totalTimeTaken / numAnswers);
  }

  return averageTime;
};
