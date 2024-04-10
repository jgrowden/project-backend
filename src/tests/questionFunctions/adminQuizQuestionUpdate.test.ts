import { requestAuthRegister, requestQuizCreate, requestQuizInfo, requestQuizQuestionCreate, requestQuestionUpdate, clear, errorCode } from '../wrapper';
import { QuestionType } from '../../dataStore';
import HTTPError from 'http-errors';

let token: string;
let quizId: number;
let questionId: number;
let questionBody: QuestionType;
beforeEach(() => {
  clear();
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

describe('Testing Question Update V1', () => {
  describe('Testing error cases', () => {
    let newQuestionBody: QuestionType;
    beforeEach(() => {
      newQuestionBody = JSON.parse(JSON.stringify(questionBody));
    });
    test('Error 401: Empty or invalid token', () => {
      expect(requestQuestionUpdate('', quizId, questionId, questionBody)).toStrictEqual(errorCode(401));
      expect(requestQuestionUpdate(token + '1', quizId, questionId, questionBody)).toStrictEqual(errorCode(401));
    });

    test('Error 403: Valid token, invalid quizId', () => {
      expect(requestQuestionUpdate(token, quizId + 1, questionId, questionBody)).toStrictEqual(errorCode(403));
      // Testing with valid quizId that the user does NOT own
      const newUser = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      const newToken = newUser.jsonBody.token as string;
      const newQuiz = requestQuizCreate(newToken, 'New Quiz', 'Description');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      const newQuestion = requestQuizQuestionCreate(newToken, newQuizId, questionBody);
      const newQuestionId = newQuestion.jsonBody.questionId as number;
      expect(requestQuestionUpdate(token, newQuizId, newQuestionId, questionBody))
        .toStrictEqual(errorCode(403));
    });

    test('Error 400: Invalid questionId', () => {
      expect(requestQuestionUpdate(token, quizId, questionId + 1, questionBody))
        .toStrictEqual(errorCode(400));
    });

    test('Error 400: Invalid question string', () => {
      newQuestionBody.question = 'Who?';
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(errorCode(400));
      newQuestionBody.question = 'whooooooooooooooooooooooooooooooooooooooooooooooooo';
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(errorCode(400));
    });

    test('Error 400: answers < 2 || answers > 6', () => {
      newQuestionBody.answers = [];
      newQuestionBody.answers.push({
        answer: 'God Usopp',
        correct: true
      });
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(errorCode(400));
      newQuestionBody.answers = questionBody.answers;
      newQuestionBody.answers.push(
        {
          answer: 'Mihawk',
          correct: false,
        },
        {
          answer: 'Roger',
          correct: false,
        },
        {
          answer: 'Garp',
          correct: false
        }
      );
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(errorCode(400));
    });

    test('Error 400: duration < 1 || totalDuration > 3 mins', () => {
      newQuestionBody.duration = -1;
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(errorCode(400));
      newQuestionBody.duration = 181;
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(errorCode(400));
    });

    test('Error 400: points < 1 || points > 10', () => {
      newQuestionBody.points = 0;
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(errorCode(400));
      newQuestionBody.points = 11;
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(errorCode(400));
    });

    test('Error 400: Question contains answer string with length < 1 || > 30', () => {
      newQuestionBody.answers[0].answer = '';
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(errorCode(400));
      newQuestionBody.answers[0].answer = 'answerrrrrrrrrrrrrrrrrrrrrrrrrr';
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(errorCode(400));
    });

    test('Error 400: Duplicate answer strings', () => {
      newQuestionBody.answers[0].answer = 'God Usopp';
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(errorCode(400));
    });

    test('Error 400: No correct answers', () => {
      newQuestionBody.answers[3].correct = false;
      expect(requestQuestionUpdate(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(errorCode(400));
    });
  });
  describe('Testing success case', () => {
    const updateQuestionBody: QuestionType = {
      question: 'Who has the longest nose?',
      duration: 5,
      points: 9,
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
    test('Successful question update:', () => {
      expect(requestQuestionUpdate(token, quizId, questionId, updateQuestionBody))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        });
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      const quizTimeEdited = quizInfo.jsonBody.timeLastEdited as number;
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId,
          name: 'Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz Description',
          numQuestions: 1,
          questions: [
            {
              questionId: questionId,
              question: 'Who has the longest nose?',
              duration: 5,
              points: 9,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Luffy',
                  colour: expect.any(String),
                  correct: false,
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Shanks',
                  colour: expect.any(String),
                  correct: false,
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Blackbeard',
                  colour: expect.any(String),
                  correct: false,
                },
                {
                  answerId: expect.any(Number),
                  answer: 'God Usopp',
                  colour: expect.any(String),
                  correct: true,
                },
              ],
            },
          ],
          duration: 5,
        }
      });
      expect(timeEdited).toBeGreaterThanOrEqual(quizTimeEdited);
      expect(timeEdited).toBeLessThanOrEqual(quizTimeEdited + 1);
    });
  });
});

describe('Testing Question Update V2', () => {
  describe('Testing error cases', () => {
    let newQuestionBody: QuestionType;
    beforeEach(() => {
      newQuestionBody = JSON.parse(JSON.stringify(questionBody));
      newQuestionBody.thumbnailUrl = 'https://theOnePieceIsReal.jpeg';
    });
    test('Error 401: Empty or invalid token', () => {
      expect(() => requestQuestionUpdateV2('', quizId, questionId, questionBody)).toThrow(HTTPError[401]);
      expect(() => requestQuestionUpdateV2(token + '1', quizId, questionId, questionBody)).toThrow(HTTPError[401]);
    });

    test('Error 403: Valid token, invalid quizId', () => {
      expect(() => requestQuestionUpdateV2(token, quizId + 1, questionId, questionBody)).toStrictEqual(HTTPError[403]);
      // Testing with valid quizId that the user does NOT own
      const newUser = requestAuthRegister('go.d.usopp@gmail.com', 'S0geking', 'God', 'Usopp');
      const newToken = newUser.jsonBody.token as string;
      const newQuiz = requestQuizCreate(newToken, 'New Quiz', 'Description');
      const newQuizId = newQuiz.jsonBody.quizId as number;
      const newQuestion = requestQuizQuestionCreate(newToken, newQuizId, questionBody);
      const newQuestionId = newQuestion.jsonBody.questionId as number;
      expect(() => requestQuestionUpdateV2(token, newQuizId, newQuestionId, questionBody))
        .toStrictEqual(HTTPError[403]);
    });

    test('Error 400: Invalid questionId', () => {
      expect(() => requestQuestionUpdateV2(token, quizId, questionId + 1, questionBody))
        .toStrictEqual(HTTPError[400]);
    });

    test('Error 400: Invalid question string', () => {
      newQuestionBody.question = 'Who?';
      expect(() => requestQuestionUpdateV2(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(HTTPError[400]);
      newQuestionBody.question = 'whooooooooooooooooooooooooooooooooooooooooooooooooo';
      expect(() => requestQuestionUpdateV2(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(HTTPError[400]);
    });

    test('Error 400: answers < 2 || answers > 6', () => {
      newQuestionBody.answers = [];
      newQuestionBody.answers.push({
        answer: 'God Usopp',
        correct: true
      });
      expect(() => requestQuestionUpdateV2(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(HTTPError[400]);
      newQuestionBody.answers = questionBody.answers;
      newQuestionBody.answers.push(
        {
          answer: 'Mihawk',
          correct: false,
        },
        {
          answer: 'Roger',
          correct: false,
        },
        {
          answer: 'Garp',
          correct: false
        }
      );
      expect(() => requestQuestionUpdateV2(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(HTTPError[400]);
    });

    test('Error 400: duration < 1 || totalDuration > 3 mins', () => {
      newQuestionBody.duration = -1;
      expect(() => requestQuestionUpdateV2(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(HTTPError[400]);
      newQuestionBody.duration = 181;
      expect(() => requestQuestionUpdateV2(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(HTTPError[400]);
    });

    test('Error 400: points < 1 || points > 10', () => {
      newQuestionBody.points = 0;
      expect(() => requestQuestionUpdateV2(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(HTTPError[400]);
      newQuestionBody.points = 11;
      expect(() => requestQuestionUpdateV2(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(HTTPError[400]);
    });

    test('Error 400: Question contains answer string with length < 1 || > 30', () => {
      newQuestionBody.answers[0].answer = '';
      expect(() => requestQuestionUpdateV2(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(HTTPError[400]);
      newQuestionBody.answers[0].answer = 'answerrrrrrrrrrrrrrrrrrrrrrrrrr';
      expect(() => requestQuestionUpdateV2(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(HTTPError[400]);
    });

    test('Error 400: Duplicate answer strings', () => {
      newQuestionBody.answers[0].answer = 'God Usopp';
      expect(() => requestQuestionUpdateV2(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(HTTPError[400]);
    });

    test('Error 400: No correct answers', () => {
      newQuestionBody.answers[3].correct = false;
      expect(() => requestQuestionUpdateV2(token, quizId, questionId, newQuestionBody))
        .toStrictEqual(HTTPError[400]);
    });
  });
  describe('Testing success case', () => {
    const updateQuestionBody: QuestionType = {
      question: 'Who has the longest nose?',
      duration: 5,
      thumbnailUrl: 'https://theOnePieceIsREAL.png',
      points: 9,
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
    test('Successful question update:', () => {
      expect(requestQuestionUpdateV2(token, quizId, questionId, updateQuestionBody))
        .toStrictEqual({
          statusCode: 200,
          jsonBody: {}
        });
      const timeEdited = ~~(Date.now() / 1000);
      const quizInfo = requestQuizInfo(token, quizId);
      const quizTimeEdited = quizInfo.jsonBody.timeLastEdited as number;
      expect(quizInfo).toStrictEqual({
        statusCode: 200,
        jsonBody: {
          quizId: quizId,
          name: 'Quiz Name',
          timeCreated: expect.any(Number),
          timeLastEdited: expect.any(Number),
          description: 'Quiz Description',
          numQuestions: 1,
          questions: [
            {
              questionId: questionId,
              question: 'Who has the longest nose?',
              duration: 5,
              thumbnailUrl: 'https://theOnePieceIsREAL.png',
              points: 9,
              answers: [
                {
                  answerId: expect.any(Number),
                  answer: 'Luffy',
                  colour: expect.any(String),
                  correct: false,
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Shanks',
                  colour: expect.any(String),
                  correct: false,
                },
                {
                  answerId: expect.any(Number),
                  answer: 'Blackbeard',
                  colour: expect.any(String),
                  correct: false,
                },
                {
                  answerId: expect.any(Number),
                  answer: 'God Usopp',
                  colour: expect.any(String),
                  correct: true,
                },
              ],
            },
          ],
          duration: 5,
          thumbnailUrl: expect.any(String)
        }
      });
      expect(timeEdited).toBeGreaterThanOrEqual(quizTimeEdited);
      expect(timeEdited).toBeLessThanOrEqual(quizTimeEdited + 1);
    });
  });
});
