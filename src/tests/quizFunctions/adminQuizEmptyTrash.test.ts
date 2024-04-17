import { requestAuthRegister, requestQuizCreate, requestQuizDelete, requestQuizTrashInfo, requestQuizTrashEmpty, clear, errorCode, requestQuizTrashEmptyV2 } from '../wrapper';
import HTTPError from 'http-errors';

describe('adminQuizEmptyTrashV1 http testing', () => {
  let token: string;
  let quizId1: number;
  let quizId2: number;
  let quizId3: number;

  beforeEach(() => {
    clear();
    const user = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    token = user.jsonBody.token as string;
    const quiz1 = requestQuizCreate(token, 'Quiz 1', 'Description 1');
    quizId1 = quiz1.jsonBody.quizId as number;
    const quiz2 = requestQuizCreate(token, 'Quiz 2', 'Description 2');
    quizId2 = quiz2.jsonBody.quizId as number;
    const quiz3 = requestQuizCreate(token, 'Quiz 3', 'Description 3');
    quizId3 = quiz3.jsonBody.quizId as number;
  });

  describe('Testing error cases', () => {
    test('Error 401: Empty or invalid token', () => {
      expect(requestQuizTrashEmpty('', [quizId1])).toStrictEqual(errorCode(401));
      expect(requestQuizTrashEmpty(token + '1', [quizId1])).toStrictEqual(errorCode(401));
    });

    test('Error 403: User does not own one or more of the quizzes', () => {
      const otherUser = requestAuthRegister('other.user@unsw.edu.au', 'otheruser123', 'Other', 'User');
      const otherToken = otherUser.jsonBody.token as string;
      requestQuizDelete(token, quizId1);
      expect(requestQuizTrashEmpty(otherToken, [quizId1])).toStrictEqual(errorCode(403));
    });

    test('Error 403: Quiz does not exist', () => {
      clear();
      const user = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
      token = user.jsonBody.token as string;
      expect(requestQuizTrashEmpty(token, [1])).toStrictEqual(errorCode(403));
    });

    test('Error 400: One or more quiz IDs not in the trash', () => {
      expect(requestQuizTrashEmpty(token, [quizId1])).toStrictEqual(errorCode(400));
    });
  });

  describe('Testing success case', () => {
    test('Success: Permanently delete quizzes from the trash', () => {
      requestQuizDelete(token, quizId1);
      requestQuizDelete(token, quizId2);
      requestQuizDelete(token, quizId3);

      expect(requestQuizTrashEmpty(token, [quizId1, quizId2])).toStrictEqual({
        statusCode: 200,
        jsonBody: {},
      });
      expect(requestQuizTrashInfo(token)).toStrictEqual(
        {
          statusCode: 200,
          jsonBody: {
            quizzes: [
              {
                quizId: quizId3,
                name: 'Quiz 3'
              }
            ]
          }
        }
      );
    });
  });
});

describe('adminQuizEmptyTrashV2 http testing', () => {
  let token: string;
  let quizId1: number;
  let quizId2: number;
  let quizId3: number;

  beforeEach(() => {
    clear();
    const user = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
    token = user.jsonBody.token as string;
    const quiz1 = requestQuizCreate(token, 'Quiz 1', 'Description 1');
    quizId1 = quiz1.jsonBody.quizId as number;
    const quiz2 = requestQuizCreate(token, 'Quiz 2', 'Description 2');
    quizId2 = quiz2.jsonBody.quizId as number;
    const quiz3 = requestQuizCreate(token, 'Quiz 3', 'Description 3');
    quizId3 = quiz3.jsonBody.quizId as number;
  });

  describe('Testing error cases', () => {
    test('Error 401: Empty or invalid token', () => {
      expect(() => requestQuizTrashEmptyV2('', [quizId1])).toThrow(HTTPError[401]);
      expect(() => requestQuizTrashEmptyV2(token + '1', [quizId1])).toThrow(HTTPError[401]);
    });

    test('Error 403: User does not own one or more of the quizzes', () => {
      const otherUser = requestAuthRegister('other.user@unsw.edu.au', 'otheruser123', 'Other', 'User');
      const otherToken = otherUser.jsonBody.token as string;
      requestQuizDelete(token, quizId1);
      expect(() => requestQuizTrashEmptyV2(otherToken, [quizId1])).toThrow(HTTPError[403]);
    });

    test('Error 403: Quiz does not exist', () => {
      clear();
      const user = requestAuthRegister('hayden.smith@unsw.edu.au', 'haydensmith123', 'Hayden', 'Smith');
      token = user.jsonBody.token as string;
      expect(() => requestQuizTrashEmptyV2(token, [1])).toThrow(HTTPError[403]);
    });

    test('Error 400: One or more quiz IDs not in the trash', () => {
      expect(() => requestQuizTrashEmptyV2(token, [quizId1])).toThrow(HTTPError[400]);
    });
  });

  describe('Testing success case', () => {
    test('Success: Permanently delete quizzes from the trash', () => {
      requestQuizDelete(token, quizId1);
      requestQuizDelete(token, quizId2);
      requestQuizDelete(token, quizId3);

      expect(requestQuizTrashEmptyV2(token, [quizId1, quizId2])).toStrictEqual({
        statusCode: 200,
        jsonBody: {},
      });
      expect(requestQuizTrashInfo(token)).toStrictEqual(
        {
          statusCode: 200,
          jsonBody: {
            quizzes: [
              {
                quizId: quizId3,
                name: 'Quiz 3'
              }
            ]
          }
        }
      );
    });
  });
});
