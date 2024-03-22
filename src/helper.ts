import { getData, UserType, QuizType, QuestionType } from './dataStore';

export const fetchUserFromUserId = (authUserId: number): UserType | undefined => {
  return getData().users.find(user => user.authUserId === authUserId);
};

export const fetchUserFromSessionId = (sessionId: string): UserType | undefined => {
  return getData().users.find(user => user.sessions.some(session => session === sessionId));
};

export const fetchQuizFromQuizId = (quizId: number): QuizType | undefined => {
  return getData().quizzes.find(quiz => quiz.quizId === quizId);
};

export const fetchQuestionFromQuestionId = (quiz: QuizType, questionId: number): QuestionType | undefined => {
  return quiz.questions.find(question => question.questionId === questionId);
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
