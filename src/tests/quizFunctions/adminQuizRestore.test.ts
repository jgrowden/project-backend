import {
  requestAuthRegister,
  requestQuizCreate,
  requestQuizInfo,
  requestQuizDelete,
  requestQuizRestore,
  requestQuizRestoreV2,
  requestQuizTrashInfo,
  clear,
  errorCode
} from '../wrapper';

import HTTPError from 'http-errors';

describe('adminQuizRestoreV1 http testing', () => {
  let token: string;
  let quizId: number;

  beforeEach(() => {
    clear();
    const user = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    token = user.jsonBody.token as string;
    const quiz = requestQuizCreate(token, 'first quiz', 'amazing quiz');
    quizId = quiz.jsonBody.quizId as number;
  });

  afterEach(() => {
    clear();
  });

  describe('Testing error cases', () => {
    test('Error 401: Empty or invalid token', () => {
      expect(requestQuizRestore('', quizId)).toStrictEqual(errorCode(401));
      expect(requestQuizRestore(token + '1', quizId)).toStrictEqual(errorCode(401));
    });

    test('Error 403: Quiz does not exist', () => {
      expect(requestQuizRestore(token, quizId + 1)).toStrictEqual(errorCode(403));
    });

    test('Error 403: User does not own quiz', () => {
      const newUser = requestAuthRegister('second.user@gmail.com', 's3c0nDUser', 'Second', 'User');
      const newToken = newUser.jsonBody.token as string;
      requestQuizDelete(token, quizId);
      expect(requestQuizRestore(newToken, quizId)).toStrictEqual(errorCode(403));
    });

    test('Error 400: Quiz name of restored quiz already used by another active quiz', () => {
      requestQuizDelete(token, quizId);
      requestQuizCreate(token, 'first quiz', 'new amazing quiz');
      expect(requestQuizRestore(token, quizId)).toStrictEqual(errorCode(400));
    });

    test('Error 400: QuizId refers to quiz not currently in trash', () => {
      expect(requestQuizRestore(token, quizId)).toStrictEqual(errorCode(400));
    });
  });

  describe('Testing success case', () => {
    test('Successfully restore a quiz from trash', () => {
      const newQuiz = requestQuizCreate(token, 'second quiz', 'new amazing quiz');
      const newQuizId = newQuiz.jsonBody.quizId as number;

      // Delete the first quiz and verify it is in the trash
      requestQuizDelete(token, quizId);
      const trashInfo = requestQuizTrashInfo(token);
      expect(trashInfo).toStrictEqual(
        {
          statusCode: 200,
          jsonBody: {
            quizzes: [
              {
                quizId: quizId,
                name: 'first quiz'
              }
            ]
          }
        }
      );

      // Delete the second quiz and verify it is in the trash
      requestQuizDelete(token, newQuizId);
      const newTrashInfo = requestQuizTrashInfo(token);
      expect(newTrashInfo).toStrictEqual(
        {
          statusCode: 200,
          jsonBody: {
            quizzes: [
              {
                quizId: quizId,
                name: 'first quiz'
              },
              {
                quizId: newQuizId,
                name: 'second quiz'
              }
            ]
          }
        }
      );

      // Restore the quiz and verify it is no longer in the trash
      expect(requestQuizRestore(token, quizId)).toStrictEqual({ statusCode: 200, jsonBody: {} });
      const updatedTrashInfo = requestQuizTrashInfo(token);
      expect(updatedTrashInfo).toStrictEqual(
        {
          statusCode: 200,
          jsonBody: {
            quizzes: [
              {
                quizId: newQuizId,
                name: 'second quiz'
              }
            ]
          }
        }
      );

      const timeEdited = ~~(Date.now() / 1000);
      // Verify the restored quiz details match the original quiz
      const restoredQuizInfo = requestQuizInfo(token, quizId);
      expect(restoredQuizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId,
          name: 'first quiz',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'amazing quiz',
          numQuestions: 0,
          questions: [],
          duration: 0
        }
      });

      // Check that the timeLastEdited timestamp is updated
      expect(timeEdited).toBeGreaterThanOrEqual(restoredQuizInfo.jsonBody.timeLastEdited as number);
      expect(timeEdited).toBeLessThanOrEqual(restoredQuizInfo.jsonBody.timeLastEdited as number + 1);
    });
  });
});

describe('adminQuizRestoreV2 http testing', () => {
  let token: string;
  let quizId: number;

  beforeEach(() => {
    clear();
    const user = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    token = user.jsonBody.token as string;
    const quiz = requestQuizCreate(token, 'first quiz', 'amazing quiz');
    quizId = quiz.jsonBody.quizId as number;
  });

  afterEach(() => {
    clear();
  });

  describe('Testing error cases', () => {
    test('Error 401: Empty or invalid token', () => {
      expect(() => requestQuizRestoreV2('', quizId)).toThrow(HTTPError[401]);
      expect(() => requestQuizRestoreV2(token + '1', quizId)).toThrow(HTTPError[401]);
    });

    test('Error 403: Quiz does not exist', () => {
      expect(() => requestQuizRestoreV2(token, quizId + 1)).toThrow(HTTPError[403]);
    });

    test('Error 403: User does not own quiz', () => {
      const newUser = requestAuthRegister('second.user@gmail.com', 's3c0nDUser', 'Second', 'User');
      const newToken = newUser.jsonBody.token as string;
      requestQuizDelete(token, quizId);
      expect(() => requestQuizRestoreV2(newToken, quizId)).toThrow(HTTPError[403]);
    });

    test('Error 400: Quiz name of restored quiz already used by another active quiz', () => {
      requestQuizDelete(token, quizId);
      requestQuizCreate(token, 'first quiz', 'new amazing quiz');
      expect(() => requestQuizRestoreV2(token, quizId)).toThrow(HTTPError[400]);
    });

    test('Error 400: QuizId refers to quiz not currently in trash', () => {
      expect(() => requestQuizRestoreV2(token, quizId)).toThrow(HTTPError[400]);
    });
  });

  describe('Testing success case', () => {
    test('Successfully restore a quiz from trash', () => {
      const newQuiz = requestQuizCreate(token, 'second quiz', 'new amazing quiz');
      const newQuizId = newQuiz.jsonBody.quizId as number;

      // Delete the first quiz and verify it is in the trash
      requestQuizDelete(token, quizId);
      const trashInfo = requestQuizTrashInfo(token);
      expect(trashInfo).toStrictEqual(
        {
          statusCode: 200,
          jsonBody: {
            quizzes: [
              {
                quizId: quizId,
                name: 'first quiz'
              }
            ]
          }
        }
      );

      // Delete the second quiz and verify it is in the trash
      requestQuizDelete(token, newQuizId);
      const newTrashInfo = requestQuizTrashInfo(token);
      expect(newTrashInfo).toStrictEqual(
        {
          statusCode: 200,
          jsonBody: {
            quizzes: [
              {
                quizId: quizId,
                name: 'first quiz'
              },
              {
                quizId: newQuizId,
                name: 'second quiz'
              }
            ]
          }
        }
      );

      // Restore the quiz and verify it is no longer in the trash
      expect(requestQuizRestoreV2(token, quizId)).toStrictEqual({ statusCode: 200, jsonBody: {} });
      const updatedTrashInfo = requestQuizTrashInfo(token);
      expect(updatedTrashInfo).toStrictEqual(
        {
          statusCode: 200,
          jsonBody: {
            quizzes: [
              {
                quizId: newQuizId,
                name: 'second quiz'
              }
            ]
          }
        }
      );

      const timeEdited = ~~(Date.now() / 1000);
      // Verify the restored quiz details match the original quiz
      const restoredQuizInfo = requestQuizInfo(token, quizId);
      expect(restoredQuizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId,
          name: 'first quiz',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'amazing quiz',
          numQuestions: 0,
          questions: [],
          duration: 0
        }
      });

      // Check that the timeLastEdited timestamp is updated
      expect(timeEdited).toBeGreaterThanOrEqual(restoredQuizInfo.jsonBody.timeLastEdited as number);
      expect(timeEdited).toBeLessThanOrEqual(restoredQuizInfo.jsonBody.timeLastEdited as number + 1);
    });
  });
});
