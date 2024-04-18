import { requestAuthRegister, requestQuizCreate, requestQuizInfo, requestQuizDescriptionUpdate, clear, errorCode, requestQuizDescriptionUpdateV2 } from '../wrapper';
import HTTPError from 'http-errors';

describe('adminQuizDescriptionUpdateV1 http testing', () => {
  let token: string;
  let quizId: number;
  const description = 'New Quiz Description';

  beforeEach(() => {
    clear();
    const user = requestAuthRegister('first.user@gmail.com', 'f1rsTUser', 'First', 'User');
    token = user.jsonBody.token as string;
    const quiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    quizId = quiz.jsonBody.quizId as number;
  });

  describe('Testing error cases', () => {
    test('Error 401: Empty or invalid token', () => {
      expect(requestQuizDescriptionUpdate('', quizId, description)).toStrictEqual(errorCode(401));
      expect(requestQuizDescriptionUpdate(token + '1', quizId, description)).toStrictEqual(errorCode(401));
    });

    test('Error 403: Valid token, invalid quizId', () => {
      expect(requestQuizDescriptionUpdate(token, quizId + 1, description)).toStrictEqual(errorCode(403));

      // Testing with valid quizId that the user does NOT own
      const newUser = requestAuthRegister('second.user@gmail.com', 's3c0nDUser', 'Second', 'User');
      const newToken = newUser.jsonBody.token as string;
      const newQuiz = requestQuizCreate(newToken, 'New Quiz', 'New Description');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      expect(requestQuizDescriptionUpdate(token, newQuizId, description)).toStrictEqual(errorCode(403));
    });

    test('Error 400: Quiz name length > 100', () => {
      expect(requestQuizDescriptionUpdate(token, quizId, 'abcedfghijklmnopqrstuvwxyzabcedfghijklmnopqrstuvwxyzabcedfghijklmnopqrstuvwxyzabcedfghijklmnopqrstuvwxyz'))
        .toStrictEqual(errorCode(400));
    });
  });

  describe('Testing success case', () => {
    test('Succesful name update', () => {
      expect(requestQuizDescriptionUpdate(token, quizId, 'Succesful Description Update'))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        });
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId,
          name: 'Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Succesful Description Update',
          duration: 0,
          numQuestions: 0,
          questions: []
        }
      });
      expect(timeEdited).toBeGreaterThanOrEqual(quizInfo.jsonBody.timeLastEdited as number);
      expect(timeEdited).toBeLessThanOrEqual(quizInfo.jsonBody.timeLastEdited as number + 1);
    });

    test('Succesful name update, 0 length string', () => {
      expect(requestQuizDescriptionUpdate(token, quizId, ''))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        });
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId,
          name: 'Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: '',
          duration: 0,
          numQuestions: 0,
          questions: []
        }
      });
      expect(timeEdited).toBeGreaterThanOrEqual(quizInfo.jsonBody.timeLastEdited as number);
      expect(timeEdited).toBeLessThanOrEqual(quizInfo.jsonBody.timeLastEdited as number + 1);
    });

    test('Succesful name update, 100 length string', () => {
      expect(requestQuizDescriptionUpdate(token, quizId, '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789'))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        });
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId,
          name: 'Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789',
          duration: 0,
          numQuestions: 0,
          questions: []
        }
      });
      expect(timeEdited).toBeGreaterThanOrEqual(quizInfo.jsonBody.timeLastEdited as number);
      expect(timeEdited).toBeLessThanOrEqual(quizInfo.jsonBody.timeLastEdited as number + 1);
    });
  });
});

describe('adminQuizDescriptionUpdateV2 http testing', () => {
  let token: string;
  let quizId: number;
  const description = 'New Quiz Description';

  beforeEach(() => {
    clear();
    const user = requestAuthRegister('first.user@gmail.com', 'f1rsTUser', 'First', 'User');
    token = user.jsonBody.token as string;
    const quiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    quizId = quiz.jsonBody.quizId as number;
  });

  describe('Testing error cases', () => {
    test('Error 401: Empty or invalid token', () => {
      expect(() => requestQuizDescriptionUpdateV2('', quizId, description)).toThrow(HTTPError[401]);
      expect(() => requestQuizDescriptionUpdateV2(token + '1', quizId, description)).toThrow(HTTPError[401]);
    });

    test('Error 403: Valid token, invalid quizId', () => {
      expect(() => requestQuizDescriptionUpdateV2(token, quizId + 1, description)).toThrow(HTTPError[403]);

      // Testing with valid quizId that the user does NOT own
      const newUser = requestAuthRegister('second.user@gmail.com', 's3c0nDUser', 'Second', 'User');
      const newToken = newUser.jsonBody.token as string;
      const newQuiz = requestQuizCreate(newToken, 'New Quiz', 'New Description');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      expect(() => requestQuizDescriptionUpdateV2(token, newQuizId, description)).toThrow(HTTPError[403]);
    });

    test('Error 400: Quiz name length > 100', () => {
      expect(() => requestQuizDescriptionUpdateV2(token, quizId, 'abcedfghijklmnopqrstuvwxyzabcedfghijklmnopqrstuvwxyzabcedfghijklmnopqrstuvwxyzabcedfghijklmnopqrstuvwxyz'))
        .toThrow(HTTPError[400]);
    });
  });

  describe('Testing success case', () => {
    test('Succesful name update', () => {
      expect(requestQuizDescriptionUpdateV2(token, quizId, 'Succesful Description Update'))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        });
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId,
          name: 'Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Succesful Description Update',
          duration: 0,
          numQuestions: 0,
          questions: []
        }
      });
      expect(timeEdited).toBeGreaterThanOrEqual(quizInfo.jsonBody.timeLastEdited as number);
      expect(timeEdited).toBeLessThanOrEqual(quizInfo.jsonBody.timeLastEdited as number + 1);
    });

    test('Succesful name update, 0 length string', () => {
      expect(requestQuizDescriptionUpdateV2(token, quizId, ''))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        });
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId,
          name: 'Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: '',
          duration: 0,
          numQuestions: 0,
          questions: []
        }
      });
      expect(timeEdited).toBeGreaterThanOrEqual(quizInfo.jsonBody.timeLastEdited as number);
      expect(timeEdited).toBeLessThanOrEqual(quizInfo.jsonBody.timeLastEdited as number + 1);
    });

    test('Succesful name update, 100 length string', () => {
      expect(requestQuizDescriptionUpdateV2(token, quizId, '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789'))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        });
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId,
          name: 'Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: '0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789',
          duration: 0,
          numQuestions: 0,
          questions: []
        }
      });
      expect(timeEdited).toBeGreaterThanOrEqual(quizInfo.jsonBody.timeLastEdited as number);
      expect(timeEdited).toBeLessThanOrEqual(quizInfo.jsonBody.timeLastEdited as number + 1);
    });
  });
});
