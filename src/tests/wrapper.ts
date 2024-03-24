import { requestHelper } from './requestHelper';
import { adminQuizQuestionCreateArgument } from '../quiz';
import { QuestionType, TokenType } from '../dataStore';

export const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) =>
  requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });

export const requestAuthLogin = (email: string, password: string) =>
  requestHelper('POST', '/v1/admin/auth/login', { email, password });

export const requestQuizList = (token: string) =>
  requestHelper('GET', '/v1/admin/quiz/list', { token });

export const requestQuizCreate = (token: string, name: string, description: string) =>
  requestHelper('POST', '/v1/admin/quiz/create', { token, name, description });

export const requestQuizDelete = (token: string, quizId: number) =>
  requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token, quizId });

export const requestQuizInfo = (token: string, quizId: number) =>
  requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token, quizId });

export const requestQuizQuestionCreate = (token: string, quizId: number,
  question: adminQuizQuestionCreateArgument) =>
  requestHelper('POST', `/v1/admin/quiz/${quizId}/question`, { token, quizId, question });

export const requestQuizTrashInfo = (token: string) =>
  requestHelper('GET', '/v1/admin/quiz/trash', { token });

export const requestUserDetails = (token: string) =>
  requestHelper('GET', '/v1/admin/user/details', { token });

export const requestUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) =>
  requestHelper('PUT', '/v1/admin/user/details', { token, email, nameFirst, nameLast });

export const requestUserPasswordUpdate = (token: TokenType, oldPassword: string, newPassword: string) =>
  requestHelper('PUT', '/v1/admin/user/password', { token, oldPassword, newPassword });

export const requestQuestionUpdate = (token: string, quizId: number, questionId: number, questionBody: QuestionType) =>
  requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token, questionBody });

export const requestQuestionDelete = (token: string, quizId: number, questionId: number) =>
  requestHelper('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token });

export const requestQuizQuestionMove = (token: string, quizId: number, questionId: number, newPosition: number) =>
  requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}/move`, { token, newPosition });

export const requestQuizQuestionDuplicate = (token: string, quizId: number, questionId: number) =>
  requestHelper('POST', `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token });

export const clear = () => requestHelper('DELETE', '/v1/clear');

export const ERROR = { error: expect.any(String) };

export const ERRORANDSTATUS = {
  error: expect.any(String),
  statusCode: expect.any(Number)
};

export const errorCode = (statusCode: number) => {
  return { statusCode: statusCode, jsonBody: ERROR };
};
