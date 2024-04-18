import { requestAuthRegister, requestQuizCreate, requestQuizCreateV2, requestQuizInfo, requestQuizInfoV2, requestQuizQuestionCreate, requestQuizQuestionCreateV2, requestQuizQuestionMove, requestQuizQuestionMoveV2, requestClear, errorCode } from '../wrapper';
import { QuestionType } from '../../dataStore';
import HTTPError from 'http-errors';

let token: string;
let quizId: number;
let questionId1: number;
let questionId2: number;
let questionId3: number;

describe('Testing /v1/admin/quiz/{quizid}/question/{questionid}/move:', () => {
  beforeEach(() => {
    requestClear();
    const user = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    token = user.jsonBody.token as string;
    const quiz = requestQuizCreate(token, 'Quiz Name', 'Quiz Description');
    quizId = quiz.jsonBody.quizId as number;
    const questionBody1: QuestionType = {
      question: 'Question1?',
      duration: 3,
      points: 4,
      answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
    };
    const questionBody2: QuestionType = {
      question: 'Question2?',
      duration: 3,
      points: 4,
      answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
    };
    const questionBody3: QuestionType = {
      question: 'Question3?',
      duration: 3,
      points: 4,
      answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
    };
    questionId1 = requestQuizQuestionCreate(token, quizId, questionBody1).jsonBody.questionId as number;
    questionId2 = requestQuizQuestionCreate(token, quizId, questionBody2).jsonBody.questionId as number;
    questionId3 = requestQuizQuestionCreate(token, quizId, questionBody3).jsonBody.questionId as number;
  });

  test('Successfully moving quiz to start', () => {
    expect(requestQuizQuestionMove(token, quizId, questionId3, 0)).toStrictEqual({
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
        duration: 9,
        numQuestions: 3,
        questions: [
          {
            questionId: questionId3,
            question: 'Question3?',
            duration: 3,
            points: 4,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
          {
            questionId: questionId1,
            question: 'Question1?',
            duration: 3,
            points: 4,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
          {
            questionId: questionId2,
            question: 'Question2?',
            duration: 3,
            points: 4,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
        ]
      }
    });
  });
  test('Successfully moving quiz to end', () => {
    expect(requestQuizQuestionMove(token, quizId, questionId1, 2)).toStrictEqual({
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
        duration: 9,
        numQuestions: 3,
        questions: [
          {
            questionId: questionId2,
            question: 'Question2?',
            duration: 3,
            points: 4,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
          {
            questionId: questionId3,
            question: 'Question3?',
            duration: 3,
            points: 4,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
          {
            questionId: questionId1,
            question: 'Question1?',
            duration: 3,
            points: 4,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
        ]
      }
    });
  });
  test('Successfully moving quiz', () => {
    expect(requestQuizQuestionMove(token, quizId, questionId1, 1)).toStrictEqual({
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
        duration: 9,
        numQuestions: 3,
        questions: [
          {
            questionId: questionId2,
            question: 'Question2?',
            duration: 3,
            points: 4,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
          {
            questionId: questionId1,
            question: 'Question1?',
            duration: 3,
            points: 4,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
          {
            questionId: questionId3,
            question: 'Question3?',
            duration: 3,
            points: 4,
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
        ]
      }
    });
  });
  test('Failed test: question ID does not refer to a valid question within this quiz.', () => {
    expect(requestQuizQuestionMove(token, quizId, -1, 0)).toStrictEqual(errorCode(400));
  });
  test('Failed test: NewPosition is less than 0.', () => {
    expect(requestQuizQuestionMove(token, quizId, questionId1, -1)).toStrictEqual(errorCode(400));
  });
  test('Failed test: NewPosition is greater than n-1 (n is number of questions in quiz).', () => {
    expect(requestQuizQuestionMove(token, quizId, questionId1, 3)).toStrictEqual(errorCode(400));
  });
  test('Failed test: NewPosition is the position of the current question.', () => {
    expect(requestQuizQuestionMove(token, quizId, questionId1, 0)).toStrictEqual(errorCode(400));
  });
  test('Failed test: Empty token.', () => {
    expect(requestQuizQuestionMove('', quizId, questionId1, 0)).toStrictEqual(errorCode(401));
  });
  test('Failed test: Invalid token.', () => {
    expect(requestQuizQuestionMove(token + '1', quizId, questionId1, 0)).toStrictEqual(errorCode(401));
  });
  test('Failed test: Quiz ID invalid.', () => {
    expect(requestQuizQuestionMove(token, quizId + 1, questionId1, 0)).toStrictEqual(errorCode(403));
  });
  test('Failed test: User does not own the quiz.', () => {
    const newUser = requestAuthRegister('frieren.theslayer@gmail.com', 'ushouldwatchfr1eren', 'Frieren', 'TheSlayer');
    const newToken = newUser.jsonBody.token as string;
    const newQuiz = requestQuizCreate(newToken, 'Quiz Name', 'Quiz Description');
    const newQuizId = newQuiz.jsonBody.quizId as number;
    const newQuestionBody: QuestionType = {
      question: 'new question',
      duration: 3,
      points: 4,
      answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
    };
    const newQuestionId = requestQuizQuestionCreate(newToken, newQuizId, newQuestionBody).jsonBody.questionId as number;
    expect(requestQuizQuestionMove(token, newQuizId, newQuestionId, 0)).toStrictEqual(errorCode(403));
  });
});

describe('Testing /v2/admin/quiz/{quizid}/question/{questionid}/move:', () => {
  beforeEach(() => {
    requestClear();
    const user = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
    token = user.jsonBody.token as string;
    const quiz = requestQuizCreateV2(token, 'Quiz Name', 'Quiz Description');
    quizId = quiz.jsonBody.quizId as number;
    const questionBody1: QuestionType = {
      question: 'Question1?',
      duration: 3,
      points: 4,
      thumbnailUrl: 'http://example.com/birb.jpg',
      answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
    };
    const questionBody2: QuestionType = {
      question: 'Question2?',
      duration: 3,
      points: 4,
      thumbnailUrl: 'http://example.com/birb.jpg',
      answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
    };
    const questionBody3: QuestionType = {
      question: 'Question3?',
      duration: 3,
      points: 4,
      thumbnailUrl: 'http://example.com/birb.jpg',
      answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
    };
    questionId1 = requestQuizQuestionCreateV2(token, quizId, questionBody1).jsonBody.questionId as number;
    questionId2 = requestQuizQuestionCreateV2(token, quizId, questionBody2).jsonBody.questionId as number;
    questionId3 = requestQuizQuestionCreateV2(token, quizId, questionBody3).jsonBody.questionId as number;
  });
  test('Successfully moving quiz to start', () => {
    expect(requestQuizQuestionMoveV2(token, quizId, questionId3, 0)).toStrictEqual({
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
        duration: 9,
        numQuestions: 3,
        thumbnailUrl: '',
        questions: [
          {
            questionId: questionId3,
            question: 'Question3?',
            duration: 3,
            points: 4,
            thumbnailUrl: 'http://example.com/birb.jpg',
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
          {
            questionId: questionId1,
            question: 'Question1?',
            duration: 3,
            points: 4,
            thumbnailUrl: 'http://example.com/birb.jpg',
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
          {
            questionId: questionId2,
            question: 'Question2?',
            duration: 3,
            points: 4,
            thumbnailUrl: 'http://example.com/birb.jpg',
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
        ]
      }
    });
  });
  test('Successfully moving quiz to end', () => {
    expect(requestQuizQuestionMoveV2(token, quizId, questionId1, 2)).toStrictEqual({
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
        duration: 9,
        numQuestions: 3,
        thumbnailUrl: '',
        questions: [
          {
            questionId: questionId2,
            question: 'Question2?',
            duration: 3,
            points: 4,
            thumbnailUrl: 'http://example.com/birb.jpg',
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
          {
            questionId: questionId3,
            question: 'Question3?',
            duration: 3,
            points: 4,
            thumbnailUrl: 'http://example.com/birb.jpg',
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
          {
            questionId: questionId1,
            question: 'Question1?',
            duration: 3,
            points: 4,
            thumbnailUrl: 'http://example.com/birb.jpg',
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
        ]
      }
    });
  });
  test('Successfully moving quiz', () => {
    expect(requestQuizQuestionMoveV2(token, quizId, questionId1, 1)).toStrictEqual({
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
        duration: 9,
        numQuestions: 3,
        thumbnailUrl: '',
        questions: [
          {
            questionId: questionId2,
            question: 'Question2?',
            duration: 3,
            points: 4,
            thumbnailUrl: 'http://example.com/birb.jpg',
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
          {
            questionId: questionId1,
            question: 'Question1?',
            duration: 3,
            points: 4,
            thumbnailUrl: 'http://example.com/birb.jpg',
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
          {
            questionId: questionId3,
            question: 'Question3?',
            duration: 3,
            points: 4,
            thumbnailUrl: 'http://example.com/birb.jpg',
            answers: [
              {
                answerId: expect.any(Number),
                answer: 'Answer!',
                colour: expect.any(String),
                correct: true
              },
              {
                answerId: expect.any(Number),
                answer: 'Another Answer!',
                colour: expect.any(String),
                correct: true
              }
            ]
          },
        ]
      }
    });
  });
  test('Failed test: question ID does not refer to a valid question within this quiz.', () => {
    expect(() => requestQuizQuestionMoveV2(token, quizId, -1, 0)).toThrow(HTTPError[400]);
  });
  test('Failed test: NewPosition is less than 0.', () => {
    expect(() => requestQuizQuestionMoveV2(token, quizId, questionId1, -1)).toThrow(HTTPError[400]);
  });
  test('Failed test: NewPosition is greater than n-1 (n is number of questions in quiz).', () => {
    expect(() => requestQuizQuestionMoveV2(token, quizId, questionId1, 3)).toThrow(HTTPError[400]);
  });
  test('Failed test: NewPosition is the position of the current question.', () => {
    expect(() => requestQuizQuestionMoveV2(token, quizId, questionId1, 0)).toThrow(HTTPError[400]);
  });
  test('Failed test: Empty token.', () => {
    expect(() => requestQuizQuestionMoveV2('', quizId, questionId1, 0)).toThrow(HTTPError[401]);
  });
  test('Failed test: Invalid token.', () => {
    expect(() => requestQuizQuestionMoveV2(token + '1', quizId, questionId1, 0)).toThrow(HTTPError[401]);
  });
  test('Failed test: Quiz ID invalid.', () => {
    expect(() => requestQuizQuestionMoveV2(token, quizId + 1, questionId1, 0)).toThrow(HTTPError[403]);
  });
  test('Failed test: User does not own the quiz.', () => {
    const newUser = requestAuthRegister('frieren.theslayer@gmail.com', 'ushouldwatchfr1eren', 'Frieren', 'TheSlayer');
    const newToken = newUser.jsonBody.token as string;
    const newQuiz = requestQuizCreateV2(newToken, 'Quiz Name', 'Quiz Description');
    const newQuizId = newQuiz.jsonBody.quizId as number;
    const newQuestionBody: QuestionType = {
      question: 'new question',
      duration: 3,
      points: 4,
      thumbnailUrl: 'http://example.com/birb.jpg',
      answers: [{ answer: 'Answer!', correct: true }, { answer: 'Another Answer!', correct: true }]
    };
    const newQuestionId = requestQuizQuestionCreateV2(newToken, newQuizId, newQuestionBody).jsonBody.questionId as number;
    expect(() => requestQuizQuestionMoveV2(token, newQuizId, newQuestionId, 0)).toThrow(HTTPError[403]);
  });
});
