/*eslint-disable*/
import HTTPError from 'http-errors';
import {
  clear,
  requestAuthRegister,
  requestQuizCreate,
  requestQuizQuestionCreate,
  requestQuizSessionStart,
  requestQuizDelete,
} from '../../wrapper';

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
  let token, quizId, questionId;
  beforeEach(() => {
    const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
    token = user.jsonBody.token as string;
    const quiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    quizId = quiz.jsonBody.quizId as number;
    questionBody = {
      question: 'Who\'s the strongest?',
      duration: 5,
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
    const question = requestQuizQuestionCreate(token, quizId, questionBody);
    questionId = question.jsonBody.questionId as number;
  });
  describe('error cases', () => {
    test('401, invalid/empty token', () => {
      expect(() => requestQuizSessionStart('', quizId, AUTOSTARTNUM)).toThrow(HTTPError[401]);
      expect(() => requestQuizSessionStart(token + '1', quizId, AUTOSTARTNUM)).toThrow(HTTPError[401]);
    });

    test('403, valid token + invalid quizId', () => {
      expect(() => requestQuizSessionStart(token, quizId + 1, AUTOSTARTNUM)).toThrow(HTTPError[400]);
    });

    test('400, autoStartNum > 50', () => {
      expect(() => requestQuizSessionStart(token, quizId, 51)).toThrow(HTTPError[400]);
    });

    test('400, 10 sessions not in END state exist for quiz', () => {
      for (let i = 0; i < 10; i++) {
        expect(requestQuizSessionStart(token, quiz, AUTOSTARTNUM)).toStrictEqual(SESSION);
      }
      expect(() => requestQuizSessionStart(token, quizId, AUTOSTARTNUM)).toThrow(HTTPError[400]);
    });

    test('400, quiz has no questions', () => {
      const newQuiz = requestQuizCreate(token, 'New Quiz', 'New description');
      const newQuizId = newQuiz.jsonBody.quizid as number;
      expect(() => requestQuizSessionStart(token, newQuizId, AUTOSTARTNUM)).toThrow(HTTPError[400]);
    });

    test('400, quiz is in trash', () => {
      expect(requestQuizDelete(token, quizId)).toStrictEqual({});
      expect(() => requestQuizSessionStart(token, quizId, AUTOSTARTNUM)).toThrow(HTTPError[400]);
    });
  });
  describe('success', () => {
    // Will make this more comprehensive once functions like quizSessionStatus are made
    test('successful quiz session start', () => {
      expect(requestQuizSessionStart(token, quizId, AUTOSTARTNUM)).toStrictEqual(SESSION);
    });
  })
})