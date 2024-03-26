/* eslint-disable */
import { requestAuthRegister, requestQuizCreate, requestQuizInfo, requestQuizNameUpdate, clear, ERROR, ERRORANDSTATUS } from '../wrapper';

let token: string;
let quizId: number;
let name: string = "New Quiz Name";

beforeEach(() => {
  clear();
  const user = requestAuthRegister('first.user@gmail.com', 'f1rsTUser', 'First', 'User');
  token = user.jsonBody.token as string;
  const quiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
  quizId = quiz.jsonBody.quizId as number;
});

describe('Testing Quiz Name Update', () => {
  describe('Testing error cases', () => {
    test('Error 401: Empty or invalid token', () => {
      expect(requestQuizNameUpdate('', quizId, name)).toStrictEqual({
        statusCode: 401,
        jsonBody: ERRORANDSTATUS
      });
      expect(requestQuizNameUpdate(token + '1', quizId, name)).toStrictEqual({
        statusCode: 401,
        jsonBody: ERRORANDSTATUS
      });
    });
    
    test('Error 403: Valid token, invalid quizId', () => {
      expect(requestQuizNameUpdate(token, quizId + 1, name)).toStrictEqual({
        statusCode: 403,
        jsonBody: ERRORANDSTATUS
      });

      // Testing with valid quizId that the user does NOT own
      const newUser = requestAuthRegister('second.user@gmail.com', 's3c0nDUser', 'Second', 'User');
      const newToken = newUser.jsonBody.token as string;
      const newQuiz = requestQuizCreate(newToken, 'New Quiz', 'New Description');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      expect(requestQuizNameUpdate(token, newQuizId, name))
        .toStrictEqual({
        statusCode: 403,
        jsonBody: ERRORANDSTATUS
      });
    });

    test('Error 400: Name contains invalid characters', () => {
      expect(requestQuizNameUpdate(token, quizId, '/!greatQUIZ>>'))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERRORANDSTATUS
      });
    });
  
    test('Error 400: Quiz name length < 3 || Quiz Name Length > 30', () => {
      expect(requestQuizNameUpdate(token, quizId, 'ab'))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERRORANDSTATUS
      });
      expect(requestQuizNameUpdate(token, quizId, 'abcedfghijklmnopqrstuvwxyz12345'))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERRORANDSTATUS
      });
    });

    test('Error 400: Name already used by user for another quiz', () => {
      const newQuiz = requestQuizCreate(token, 'New Quiz', 'New Description');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      expect(requestQuizNameUpdate(token, newQuizId, 'Quiz Name'))
        .toStrictEqual({
        statusCode: 400,
        jsonBody: ERRORANDSTATUS
      });
    });
  });
  
  describe('Testing success case', () => {
    test('Succesful name update', () => {
      expect(requestQuizNameUpdate(token, quizId, 'Succesful Name Update'))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        })
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: { 
          quizId: quizId,
          name: 'Succesful Name Update',
          ownerId: 0,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz Description',
          duration: 0,
          numQuestions: 0,
          questions: []
        }
      });
      expect(timeEdited).toBeGreaterThanOrEqual(quizInfo.jsonBody.timeLastEdited);
      expect(timeEdited).toBeLessThanOrEqual(quizInfo.jsonBody.timeLastEdited + 1);
    });

    test('Succesful name update, 3 character name', () => {
      expect(requestQuizNameUpdate(token, quizId, 'Abc'))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        })
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: { 
          quizId: quizId,
          name: 'Abc',
          ownerId: 0,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz Description',
          duration: 0,
          numQuestions: 0,
          questions: []
        }
      });
      expect(timeEdited).toBeGreaterThanOrEqual(quizInfo.jsonBody.timeLastEdited);
      expect(timeEdited).toBeLessThanOrEqual(quizInfo.jsonBody.timeLastEdited + 1);
    });

    test('Succesful name update, 30 character name', () => {
      expect(requestQuizNameUpdate(token, quizId, 'ABCdefghijklmnopqrstuvwxyz1234'))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        })
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: { 
          quizId: quizId,
          name: 'ABCdefghijklmnopqrstuvwxyz1234',
          ownerId: 0,
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz Description',
          duration: 0,
          numQuestions: 0,
          questions: []
        }
      });
      expect(timeEdited).toBeGreaterThanOrEqual(quizInfo.jsonBody.timeLastEdited);
      expect(timeEdited).toBeLessThanOrEqual(quizInfo.jsonBody.timeLastEdited + 1);
    });
  });
});
