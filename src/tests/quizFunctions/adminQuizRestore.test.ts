/* eslint-disable */
import { requestAuthRegister, requestQuizCreate, requestQuizInfo, requestQuizDelete, requestQuizRestore, requestQuizTrashInfo, clear, errorCode } from '../wrapper';

let token: string;
let quizId: number;

beforeEach(() => {
  clear();
  const user = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
  token = user.jsonBody.token as string;
  const quiz = requestQuizCreate(token, 'first quiz', 'amazing quiz');
  quizId = quiz.jsonBody.quizId as number;
});

describe('Testing Quiz Restore', () => {
  describe('Testing error cases', () => {
    test('Error 401: Empty or invalid token', () => {
      expect(requestQuizRestore('', quizId)).toStrictEqual(errorCode(401));
      expect(requestQuizRestore(token + '1', quizId)).toStrictEqual(errorCode(401));
    });
  
    test('Error 403: Valid token, invalid quizId', () => {
      expect(requestQuizRestore(token, quizId + 1)).toStrictEqual(errorCode(403));

      // Testing with valid quizId that the user does NOT own
      const newUser = requestAuthRegister('second.user@gmail.com', 's3c0nDUser', 'Second', 'User');
      const newToken = newUser.jsonBody.token as string;
      const newQuiz = requestQuizCreate(newToken, 'New Quiz', 'New Description');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      expect(requestQuizRestore(token, newQuizId)).toStrictEqual(errorCode(403));
    });

    test('Error 400: Quiz name of restored quiz already used by another active quiz', () => {
      requestQuizDelete(token, quizId);
      const newQuiz = requestQuizCreate(token, 'first quiz', 'new amazing quiz');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      expect(requestQuizRestore(token, quizId)).toStrictEqual(errorCode(400));
    });

    test('Error 400: QuizId refers to quiz not currently in trash', () => {
      requestQuizDelete(token, quizId);
      const newQuiz = requestQuizCreate(token, 'second quiz', 'new amazing quiz');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      expect(requestQuizRestore(token, newQuizId)).toStrictEqual(errorCode(400));
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