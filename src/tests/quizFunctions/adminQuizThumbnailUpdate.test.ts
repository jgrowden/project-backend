import HTTPError from 'http-errors';
import {
  requestAuthRegister,
  requestQuizInfoV2,
  requestQuizCreateV2,
  requestQuizThumbnailUpdate,
  clear
} from '../wrapper';
import { currentTime } from '../../helper';

beforeAll(() => {
  clear();
});
afterEach(() => {
  clear();
});
const imgUrl = 'http://threeSwordStyle.png';
let token: string, quizId: number;

describe('adminQuizThumbnailUpdate', () => {
  beforeEach(() => {
    token = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp').jsonBody.token as string;
    quizId = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description').jsonBody.quizId as number;
  });

  test('401, invalid/empty token', () => {
    expect(() => requestQuizThumbnailUpdate(token + '1', quizId, imgUrl)).toThrow(HTTPError[401]);
    expect(() => requestQuizThumbnailUpdate('', quizId, imgUrl)).toThrow(HTTPError[401]);
  });

  test('403, valid token, invalid quizId', () => {
    expect(() => requestQuizThumbnailUpdate(token, quizId + 1, imgUrl)).toThrow(HTTPError[403]);
    const newToken = requestAuthRegister('doffy@gmail.com', 'String-Str1ng',
      'Donquixote', 'Doflamingo').jsonBody.token as string;
    const newQuizId = requestQuizCreateV2(newToken, 'Name', 'Description').jsonBody.quizId as number;
    expect(() => requestQuizThumbnailUpdate(token, newQuizId, imgUrl)).toThrow(HTTPError[403]);
  });

  test('400, invalid imgUrl', () => {
    expect(() => requestQuizThumbnailUpdate(token, quizId, 'photo.jpeg')).toThrow(HTTPError[400]);
    expect(() => requestQuizThumbnailUpdate(token, quizId, 'https://photo.com.au')).toThrow(HTTPError[400]);
  });

  test('200, success', () => {
    expect(requestQuizThumbnailUpdate(token, quizId, 'https://GodUsopp.jpg')).toStrictEqual({
      statusCode: 200,
      jsonBody: {}
    });
    const timeEdited = currentTime();
    const quizInfo = requestQuizInfoV2(token, quizId);
    const expTimeEdited = quizInfo.jsonBody.timeLastEdited as number;
    expect(quizInfo).toStrictEqual({
      statusCode: 200,
      jsonBody: {
        quizId: quizId,
        name: 'Quiz Name',
        timeCreated: expect.any(Number),
        timeLastEdited: expect.any(Number),
        description: 'Quiz Description',
        numQuestions: 0,
        questions: [],
        duration: 0,
        thumbnailUrl: 'https://GodUsopp.jpg'
      }
    });
    expect(timeEdited).toBeGreaterThanOrEqual(expTimeEdited);
    expect(timeEdited).toBeLessThanOrEqual(expTimeEdited + 1);
  });
});
