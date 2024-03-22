import { requestHelper } from './requestHelper';

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) =>
  requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });

const requestAuthLogin = (email: string, password: string) =>
  requestHelper('POST', '/v1/admin/auth/login', { email, password });

const requestQuizCreate = (token: string, name: string, description: string) =>
  requestHelper('POST', '/v1/quiz/create', { token, name, description });

const requestUserDetails = (token: string) =>
  requestHelper('GET', '/v1/admin/user/details', { token });

const clear = () => requestHelper('DELETE', '/v1/clear');

const ERROR = { error: expect.any(String) };

const errorCode = (statusCode: number) => {
  return { statusCode: statusCode, jsonBody: ERROR };
};

export { requestAuthRegister, requestAuthLogin, requestUserDetails, requestQuizCreate, errorCode, clear, ERROR };
