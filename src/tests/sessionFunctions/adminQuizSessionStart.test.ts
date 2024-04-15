import HTTPError from 'http-errors';
import { QuestionType } from '../../dataStore';
import {
  clear,
  requestAuthRegister,
  requestQuizCreateV2,
  requestQuizQuestionCreateV2,
  requestQuizSessionStart,
  requestQuizDelete,
} from '../wrapper';

beforeAll(() => {
  clear();
});
afterEach(() => {
  clear();
});
const AUTOSTARTNUM = 10;
const SESSION = {
  sessionId: expect.any(Number)
};

describe('quizSessionStart', () => {
  let token: string, quizId: number, questionBody: QuestionType;
  beforeEach(() => {
    const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
    token = user.jsonBody.token as string;
    const quiz = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description');
    quizId = quiz.jsonBody.quizId as number;
    questionBody = {
      question: 'Who\'s the strongest?',
      duration: 5,
      thumbnailUrl: 'http://GodUsopp.png',
      points: 6,
      answers: [
        {
          answer: 'Luffy',
          correct: false,
        },
        {
          answer: 'Shanks',
          correct: false,
        },
        {
          answer: 'Blackbeard',
          correct: false,
        },
        {
          answer: 'God Usopp',
          correct: true,
        },
      ],
    };
    requestQuizQuestionCreateV2(token, quizId, questionBody);
  });
  describe('error cases', () => {
    test('401, invalid/empty token', () => {
      expect(() => requestQuizSessionStart('', quizId, AUTOSTARTNUM)).toThrow(HTTPError[401]);
      expect(() => requestQuizSessionStart(token + '1', quizId, AUTOSTARTNUM)).toThrow(HTTPError[401]);
    });
    test('403, valid token + invalid quizId', () => {
      expect(() => requestQuizSessionStart(token, quizId + 1, AUTOSTARTNUM)).toThrow(HTTPError[403]);
      const newUser = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      const newToken = newUser.jsonBody.token as string;
      const newQuiz = requestQuizCreateV2(newToken, 'New Quiz', 'Description');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      expect(() => requestQuizSessionStart(token, newQuizId, AUTOSTARTNUM)).toThrow(HTTPError[403]);
    });
    test('400, autoStartNum > 50', () => {
      expect(() => requestQuizSessionStart(token, quizId, 51)).toThrow(HTTPError[400]);
    });
    test('400, 10 sessions not in END state exist for quiz', () => {
      for (let i = 0; i < 10; i++) {
        expect(requestQuizSessionStart(token, quizId, AUTOSTARTNUM)).toStrictEqual({
          statusCode: 200,
          jsonBody: SESSION
        });
      }
      expect(() => requestQuizSessionStart(token, quizId, AUTOSTARTNUM)).toThrow(HTTPError[400]);
    });
    test('400, quiz has no questions', () => {
      const newQuiz = requestQuizCreateV2(token, 'New quiz', 'description');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      expect(() => requestQuizSessionStart(token, newQuizId, AUTOSTARTNUM)).toThrow(HTTPError[400]);
    });
    test('400, quiz is in trash', () => {
      expect(requestQuizDelete(token, quizId)).toStrictEqual({
        statusCode: 200,
        jsonBody: {}
      });
      expect(() => requestQuizSessionStart(token, quizId, AUTOSTARTNUM)).toThrow(HTTPError[400]);
    });
  });

  describe('success', () => {
    // Will make this more comprehensive once functions like quizSessionStatus are made
    test('successful quiz session start', () => {
      expect(requestQuizSessionStart(token, quizId, AUTOSTARTNUM)).toStrictEqual({
        statusCode: 200,
        jsonBody: SESSION
      });
    });
  });
});
