import { getData, UserType, QuizType, QuestionType } from './dataStore';

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

// generates psudorandom numbers, max 524287 unique Ids
const hash = (i: number): number => {
  return ((((54787 * i) % 524287) + 524287) % 524287);
};

export const generateNewUserId = (): number => {
  const data = getData();
  let newUserId = 2354;
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
  let newQuestionId = 0;
  const QuestionIds = [];
  for (const quiz of data.quizzes) {
    for (const question of quiz.questions) {
      QuestionIds.push(question.questionId);
    }
  }
  while (QuestionIds.includes(newQuestionId)) {
    newQuestionId++;
  }
  return newQuestionId;
};

export const generateQuizSessionId = (): number => {
  const data = getData();
  let newQuizSessionId = 0;
  const quizSessionIds = [];
  for (const quiz of data.quizzes) {
    for (const quizSession of quiz.quizSessions) {
      quizSessionIds.push(quizSession.quizSessionId);
    }
  }
  while (quizSessionIds.includes(newQuizSessionId)) {
    newQuizSessionId++;
  }
  return newQuizSessionId;
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
