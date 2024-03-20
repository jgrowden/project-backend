import { requestHelper } from './requestHelper';

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) =>
  requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });

const requestAuthLogin = (email: string, password: string) =>
  requestHelper('POST', '/v1/admin/auth/login', { email, password });

const requestQuizCreate = (token: string, name: string, description: string) =>
  requestHelper('POST', '/v1/admin/quiz/create', { token, name, description });

const requestQuizDelete = (token: string, quizId: number) => {
  requestHelper('DELETE', '/v1/admin/quiz/delete', { token, quizId });
}

const clear = () => requestHelper('DELETE', '/v1/clear');

const ERROR = { error: expect.any(String) };

export { requestAuthRegister, requestAuthLogin, requestQuizCreate, requestQuizDelete, clear, ERROR };
