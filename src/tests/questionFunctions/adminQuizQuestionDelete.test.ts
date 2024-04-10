import HTTPError from 'http-errors';
import {
  requestAuthRegister,
  requestQuizCreate,
  requestQuizCreateV2,
  requestQuizInfo,
  requestQuizInfoV2,
  requestQuizQuestionCreate,
  requestQuizQuestionCreateV2,
  requestQuestionDelete,
  requestQuestionDeleteV2,
  requestQuizSessionStart,
  clear,
  errorCode
} from '../wrapper';
import { QuestionType } from '../../dataStore';

let token: string;
let quizId: number;
let questionId: number;
let questionBody: QuestionType;

afterAll(() => {
  clear();
});
beforeEach(() => {
  clear();
  const user = requestAuthRegister('gon.freecs@gmail.com', 'GonF1shing', 'Gon', 'Freecs');
  token = user.jsonBody.token as string;
})

describe('Testing Question Delete V1', () => {
  beforeEach(() => {
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
  describe('Testing error cases', () => {
    test('Error 401: Empty or invalid token', () => {
      expect(requestQuestionDelete('', quizId, questionId)).toStrictEqual(errorCode(401));
      expect(requestQuestionDelete(token + '1', quizId, questionId)).toStrictEqual(errorCode(401));
    });
    test('Error 403: Valid token, invalid quizId', () => {
      expect(requestQuestionDelete(token, quizId + 1, questionId)).toStrictEqual(errorCode(403));
      // Testing with valid quizId that the user does NOT own
      const newUser = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      const newToken = newUser.jsonBody.token as string;
      const newQuiz = requestQuizCreate(newToken, 'New Quiz', 'Description');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      const newQuestion = requestQuizQuestionCreate(newToken, newQuizId, questionBody);
      const newQuestionId = newQuestion.jsonBody.questionId as number;
      expect(requestQuestionDelete(token, newQuizId, newQuestionId))
        .toStrictEqual(errorCode(403));
    });
    test('Error 400: Valid token, valid quizId, invalid questionId', () => {
      expect(requestQuestionDelete(token, quizId, questionId + 1))
        .toStrictEqual(errorCode(400));
    });
  });
  describe('Testing success case', () => {
    test('Succesful question deletion', () => {
      expect(requestQuestionDelete(token, quizId, questionId))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        });
      expect(requestQuizInfo(token, quizId)).toStrictEqual({
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
        }
      });
    });
  });
});

describe('Testing Question Delete V2', () => {
  beforeEach(() => {
    const quiz = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description');
    quizId = quiz.jsonBody.quizId as number;
    questionBody = {
      question: 'Who\'s the strongest?',
      duration: 5,
      thumbnailUrl: 'http://yonkos.jpg',
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
    const question = requestQuizQuestionCreateV2(token, quizId, questionBody);
    questionId = question.jsonBody.questionId as number;
  });
  describe('Testing error cases', () => {
    test('Error 401: Empty or invalid token', () => {
      expect(() => requestQuestionDeleteV2('', quizId, questionId)).toThrow(HTTPError[401]);
      expect(() => requestQuestionDeleteV2(token + '1', quizId, questionId)).toThrow(HTTPError[401]);
    });
    test('Error 403: Valid token, invalid quizId', () => {
      expect(() => requestQuestionDeleteV2(token, quizId + 1, questionId)).toThrow(HTTPError[403]);
      // Testing with valid quizId that the user does NOT own
      const newUser = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      const newToken = newUser.jsonBody.token as string;
      const newQuiz = requestQuizCreate(newToken, 'New Quiz', 'Description');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      const newQuestion = requestQuizQuestionCreate(newToken, newQuizId, questionBody);
      const newQuestionId = newQuestion.jsonBody.questionId as number;
      expect(() => requestQuestionDeleteV2(token, newQuizId, newQuestionId))
        .toThrow(HTTPError[403]);
    });
    test('Error 400: Valid token, valid quizId, invalid questionId', () => {
      expect(() => requestQuestionDeleteV2(token, quizId, questionId + 1))
        .toThrow(HTTPError[400]);
    });
    test('Error 400: Quiz has a session not in END state', () => {
      requestQuizSessionStart(token, quizId, 5);
      expect(() => requestQuestionDeleteV2(token, quizId, questionId)).toThrow(HTTPError[400]);
    });
  });
  describe('Testing success case', () => {
    test('Succesful question deletion', () => {
      expect(() => requestQuestionDeleteV2(token, quizId, questionId))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        });
      expect(requestQuizInfoV2(token, quizId)).toStrictEqual({
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
          thumbnailUrl: expect.any(String),
        }
      });
    });
  });
});
