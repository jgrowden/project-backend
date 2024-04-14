import { requestHelper } from './requestHelper';
import { QuestionType } from '../dataStore';

export const requestAuthRegister = (email: string, password: string, nameFirst: string, nameLast: string) =>
  requestHelper('POST', '/v1/admin/auth/register', { email, password, nameFirst, nameLast });

export const requestAuthLogin = (email: string, password: string) =>
  requestHelper('POST', '/v1/admin/auth/login', { email, password });

export const requestAuthLogout = (token: string) =>
  requestHelper('POST', '/v1/admin/auth/logout', { token });

export const requestAuthLogoutV2 = (token: string) =>
  requestHelper('POST', '/v2/admin/auth/logout', {}, { token });

export const requestQuizList = (token: string) =>
  requestHelper('GET', '/v1/admin/quiz/list', { token });

export const requestQuizCreate = (token: string, name: string, description: string) =>
  requestHelper('POST', '/v1/admin/quiz', { token, name, description });

export const requestQuizCreateV2 = (token: string, name: string, description: string) =>
  requestHelper('POST', '/v2/admin/quiz', { name, description }, { token });

export const requestQuizDelete = (token: string, quizId: number) =>
  requestHelper('DELETE', `/v1/admin/quiz/${quizId}`, { token });

export const requestQuizDeleteV2 = (token: string, quizId: number) =>
  requestHelper('DELETE', `/v2/admin/quiz/${quizId}`, {}, { token });

export const requestQuizInfo = (token: string, quizId: number) =>
  requestHelper('GET', `/v1/admin/quiz/${quizId}`, { token });

export const requestQuizInfoV2 = (token: string, quizId: number) =>
  requestHelper('GET', `/v2/admin/quiz/${quizId}`, {}, { token });

export const requestQuizDescriptionUpdate = (token: string, quizId: number, description: string) =>
  requestHelper('PUT', `/v1/admin/quiz/${quizId}/description`, { token, description });

export const requestQuizQuestionCreate = (token: string, quizId: number, questionBody: QuestionType) =>
  requestHelper('POST', `/v1/admin/quiz/${quizId}/question`, { token, questionBody });

export const requestQuizQuestionCreateV2 = (token: string, quizId: number, questionBody: QuestionType) =>
  requestHelper('POST', `/v2/admin/quiz/${quizId}/question`, { questionBody }, { token });

export const requestQuizTrashInfo = (token: string) =>
  requestHelper('GET', '/v1/admin/quiz/trash', { token });

export const requestQuizRestore = (token: string, quizId: number) =>
  requestHelper('POST', `/v1/admin/quiz/${quizId}/restore`, { token });

export const requestQuizTrashEmpty = (token: string, quizIds: number[]) =>
  requestHelper('DELETE', '/v1/admin/quiz/trash/empty', { token, quizIds: JSON.stringify(quizIds) });

export const requestUserDetails = (token: string) =>
  requestHelper('GET', '/v1/admin/user/details', { token });

export const requestUserDetailsUpdate = (token: string, email: string, nameFirst: string, nameLast: string) =>
  requestHelper('PUT', '/v1/admin/user/details', { token, email, nameFirst, nameLast });

export const requestUserPasswordUpdate = (token: string, oldPassword: string, newPassword: string) =>
  requestHelper('PUT', '/v1/admin/user/password', { token, oldPassword, newPassword });

export const requestQuizNameUpdate = (token: string, quizId: number, name: string) =>
  requestHelper('PUT', `/v1/admin/quiz/${quizId}/name`, { token, name });

export const requestQuestionUpdate = (token: string, quizId: number, questionId: number, questionBody: QuestionType) =>
  requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token, questionBody });

export const requestQuestionUpdateV2 = (token: string, quizId: number, questionId: number, questionBody: QuestionType) =>
  requestHelper('PUT', `/v2/admin/quiz/${quizId}/question/${questionId}`, { questionBody }, { token });

export const requestQuestionDelete = (token: string, quizId: number, questionId: number) =>
  requestHelper('DELETE', `/v1/admin/quiz/${quizId}/question/${questionId}`, { token });

export const requestQuestionDeleteV2 = (token: string, quizId: number, questionId: number) =>
  requestHelper('DELETE', `/v2/admin/quiz/${quizId}/question/${questionId}`, {}, { token });

export const requestQuizQuestionMove = (token: string, quizId: number, questionId: number, newPosition: number) =>
  requestHelper('PUT', `/v1/admin/quiz/${quizId}/question/${questionId}/move`, { token, newPosition });

export const requestQuizQuestionDuplicate = (token: string, quizId: number, questionId: number) =>
  requestHelper('POST', `/v1/admin/quiz/${quizId}/question/${questionId}/duplicate`, { token });

export const requestQuizChangeOwner = (quizId: number, token: string, userEmail: string) =>
  requestHelper('POST', `/v1/admin/quiz/${quizId}/transfer`, { token, userEmail });

export const requestQuizChangeOwnerV2 = (quizId: number, token: string, userEmail: string) =>
  requestHelper('POST', `/v2/admin/quiz/${quizId}/transfer`, { userEmail }, { token });

export const requestQuizThumbnailUpdate = (token: string, quizId: number, imgUrl: string) =>
  requestHelper('PUT', `/v1/admin/quiz/${quizId}/thumbnail`, { imgUrl }, { token });

export const requestQuizSessionStart = (token: string, quizId: number, autoStartNum: number) =>
  requestHelper('POST', `/v1/admin/quiz/${quizId}/session/start`, { autoStartNum }, { token });

export const requestQuizSessionInfo = (token: string, quizId: number, sessionId: number) =>
  requestHelper('GET', `/v1/admin/quiz/${quizId}/session/${sessionId}`, {}, { token });

export const requestQuizSessionUpdate = (token: string, quizId: number, sessionId: number, action: string) =>
  requestHelper('PUT', `/v1/admin/quiz/${quizId}/session/${sessionId}`, { action }, { token });

export const requestQuizSessionsView = (token: string, quizId: number) =>
  requestHelper('GET', `/v1/admin/quiz/${quizId}/sessions`, {}, { token });

export const requestQuizSessionPlayerJoin = (sessionId: number, name: string) =>
  requestHelper('POST', '/v1/player/join', { sessionId, name }, {});

export const requestPlayerStatus = (playerId: number) =>
  requestHelper('GET', `/v1/player/${playerId}`, { playerId }, {});

export const requestPlayerQuestionPosition = (playerId: number, questionPosition: number) =>
  requestHelper('GET', `/v1/player/${playerId}/question/${questionPosition}`, { playerId, questionPosition }, {});

export const requestQuizSessionPlayerAnswer = (playerId: number, questionPosition: number, answerIds: number[]) =>
  requestHelper('PUT', `/v1/player/${playerId}/question/${questionPosition}/answer`, { answerIds }, {});

export const clear = () => requestHelper('DELETE', '/v1/clear');

export const errorCode = (statusCode: number) => {
  return { statusCode: statusCode, jsonBody: { error: expect.any(String) } };
};
