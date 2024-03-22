import { requestHelper } from './requestHelper';

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) =>
  requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });

const requestAuthLogin = (email: string, password: string) =>
  requestHelper('POST', '/v1/admin/auth/login', { email, password });

const requestUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) => 
  requestHelper('PUT', '/v1/admin/user/details', { token, email, nameFirst, nameLast });

const clear = () => requestHelper('DELETE', '/v1/clear');

const ERROR = { error: expect.any(String) };

export { requestAuthRegister, requestAuthLogin, requestUserDetailsUpdate, clear, ERROR };
