import { requestHelper } from './requestHelper';
import { QuestionType } from '../dataStore';
const ERROR = { error: expect.any(String) };

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) =>
  requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });

const requestAuthLogin = (email: string, password: string) =>
  requestHelper('POST', '/v1/admin/auth/login', { email, password });

const requestUserDetails = (token: string) =>
  requestHelper('GET', '/v1/admin/user/details', { token });

<<<<<<< b13ab7135949f82e375bdb01883c2b6be9ecdc49
const requestQuestionUpdate = (sessionId: string, quizId: number, questionId: number, questionBody: QuestionType) =>
  requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`, { sessionId, questionBody });

const clear = () => requestHelper('DELETE', '/v1/clear');

export { requestAuthRegister, requestAuthLogin, requestUserDetails, requestQuestionUpdate, clear, ERROR };
=======
const clear = () => requestHelper('DELETE', '/v1/clear');

const ERROR = { error: expect.any(String) };

export { requestAuthRegister, requestAuthLogin, requestUserDetails, clear, ERROR };
>>>>>>> ac1af1299e80c30c20ce78f5f4ccf08da173d35d
