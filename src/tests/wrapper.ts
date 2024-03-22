import { requestHelper } from './requestHelper';
import { QuestionType, TokenType } from '../dataStore';

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) =>
  requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });

const requestAuthLogin = (email: string, password: string) =>
  requestHelper('POST', '/v1/admin/auth/login', { email, password });

const requestQuizCreate = (token: string, name: string, description: string) =>
  requestHelper('POST', '/v1/admin/quiz/create', { token, name, description });

const requestQuizDelete = (token: string, quizId: number) =>
  requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token, quizId });

const requestQuizInfo = (token: string, quizId: number) =>
  requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token, quizId });

const requestUserDetails = (token: string) =>
  requestHelper('GET', '/v1/admin/user/details', { token });

const requestUserPasswordUpdate = (token: TokenType, oldPassword: string, newPassword: string) =>
  requestHelper('PUT', '/v1/admin/user/password', { token, oldPassword, newPassword });

const requestQuestionUpdate = (sessionId: string, quizId: number, questionId: number, questionBody: QuestionType) =>
  requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`, { sessionId, questionBody });

const clear = () => requestHelper('DELETE', '/v1/clear');

const ERROR = { error: expect.any(String) };

const ERRORANDSTATUS = {
  error: expect.any(String),
  statusCode: expect.any(Number)
};

const errorCode = (statusCode: number) => {
  return { statusCode: statusCode, jsonBody: ERROR };
};

export { requestAuthRegister, requestAuthLogin, requestUserDetails, requestQuizDelete, requestQuizCreate, requestQuizInfo, requestUserPasswordUpdate, requestQuestionUpdate, errorCode, clear, ERROR, ERRORANDSTATUS };
