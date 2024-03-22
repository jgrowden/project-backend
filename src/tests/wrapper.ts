import { requestHelper } from './requestHelper';
import { TokenType } from '../dataStore';

const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) =>
  requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });

const requestAuthLogin = (email: string, password: string) =>
  requestHelper('POST', '/v1/admin/auth/login', { email, password });

const requestUserDetails = (token: string) =>
  requestHelper('GET', '/v1/admin/user/details', { token });

const requestUserPasswordUpdate = (token: TokenType, oldPassword: string, newPassword: string) =>
  requestHelper('PUT', '/v1/admin/user/password', { token, oldPassword, newPassword });

const clear = () => requestHelper('DELETE', '/v1/clear');

const ERROR = { error: expect.any(String) };

const ERRORANDSTATUS = {
  error: expect.any(String),
  statusCode: expect.any(Number)
};

export { requestAuthRegister, requestAuthLogin, requestUserDetails, requestUserPasswordUpdate, clear, ERROR, ERRORANDSTATUS };
