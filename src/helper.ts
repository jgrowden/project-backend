import { getData, UserType, QuizType } from './dataStore';

const fetchUserFromUserId = (authUserId: number): UserType | undefined => {
  return getData().users.find(user => user.authUserId === authUserId);
};

const fetchQuizFromQuizId = (quizId: number): QuizType | undefined => {
  return getData().quizzes.find(quiz => quiz.quizId === quizId);
};

const userWithEmailExists = (email: string): UserType | undefined => {
  return getData().users.find(user => user.email === email);
};

const generateNewUserId = (): number => {
  const data = getData();
  let newUserId = 0;
  const userIds = data.users.map(user => user.authUserId);
  while (userIds.includes(newUserId)) {
    newUserId++;
  }
  return newUserId;
};

const generateNewQuizId = (): number => {
  const data = getData();
  let newQuizId = 0;
  const quizIds = data.quizzes.map(quiz => quiz.quizId);
  while (quizIds.includes(newQuizId)) {
    newQuizId++;
  }
  return newQuizId;
};

const currentTime = (): number => {
  return Math.floor(Date.now() / 1000);
};

export { fetchUserFromUserId, fetchQuizFromQuizId, userWithEmailExists, generateNewUserId, generateNewQuizId, currentTime };
