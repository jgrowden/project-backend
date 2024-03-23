import { getData, UserType, QuizType } from './dataStore';
import { ErrorObject, ErrorObjectWithCode } from './quiz';

export const fetchUserFromUserId = (authUserId: number): UserType | undefined => {
  return getData().users.find(user => user.authUserId === authUserId);
};

export const fetchUserFromSessionId = (sessionId: string): UserType | undefined => {
  return getData().users.find(user => user.sessions.some(session => session === sessionId));
};

export const fetchQuizFromQuizId = (quizId: number): QuizType | undefined => {
  return getData().quizzes.find(quiz => quiz.quizId === quizId);
};

export const userWithEmailExists = (email: string): UserType | undefined => {
  return getData().users.find(user => user.email === email);
};

export const generateNewUserId = (): number => {
  const data = getData();
  let newUserId = 0;
  const userIds = data.users.map(user => user.authUserId);
  while (userIds.includes(newUserId)) {
    newUserId++;
  }
  return newUserId;
};

export const generateNewQuizId = (): number => {
  const data = getData();
  let newQuizId = 0;
  const quizIds = data.quizzes.map(quiz => quiz.quizId);
  while (quizIds.includes(newQuizId)) {
    newQuizId++;
  }
  return newQuizId;
};

export const currentTime = (): number => {
  return Math.floor(Date.now() / 1000);
};

export const returnError = (errorString: string, errorCode: number): ErrorObjectWithCode => {
  const err: ErrorObject = { error: errorString };
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
